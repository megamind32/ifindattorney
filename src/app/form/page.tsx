'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { determineLocationFromCoordinates } from '@/lib/location-mapping';
import { nigerianLGAData } from '@/lib/nigerian-lgas';

// Force dynamic rendering to prevent static prerendering and ensure headers are applied
export const dynamic = 'force-dynamic';

interface FormData {
  practiceAreas: string[];
  legalIssue: string;
  state: string;
  lga: string;
  budget: string;
}

const practiceAreas = [
  'Employment Law',
  'Family Law',
  'Property Law',
  'Corporate Law',
  'Commercial Law',
  'Dispute Resolution',
  'Immigration Law',
  'Intellectual Property',
];

// Nigerian states for manual selection
const nigerianStates = Object.keys(nigerianLGAData).sort();

function FormPageContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | null>(null);

  const [formData, setFormData] = useState<FormData>({
    practiceAreas: [],
    legalIssue: '',
    state: '',
    lga: '',
    budget: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [locationAttempted, setLocationAttempted] = useState(false);

  // Check permission status on component mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');
      }
    } catch (err) {
      console.log('Permission check not supported');
    }
  };

  const handlePracticeAreaChange = (area: string) => {
    setFormData((prev) => {
      const updatedAreas = prev.practiceAreas.includes(area)
        ? prev.practiceAreas.filter((a) => a !== area)
        : [...prev.practiceAreas, area];
      return {
        ...prev,
        practiceAreas: updatedAreas,
      };
    });
    setError('');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleUseLocation = async () => {
    setGettingLocation(true);
    setError('');
    setLocationSuccess(false);
    setLocationAttempted(true);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please try using a different browser.');
      setGettingLocation(false);
      return;
    }

    // Use high accuracy and proper timeout settings for mobile
    const options = {
      enableHighAccuracy: true,
      timeout: 60000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const locationMatch = determineLocationFromCoordinates({
            latitude,
            longitude,
          });

          if (locationMatch) {
            setFormData((prev) => ({
              ...prev,
              state: locationMatch.state,
              lga: locationMatch.lga,
            }));
            setLocationSuccess(true);
            setError('');
          } else {
            setError('Could not determine your location within Nigeria. Please ensure you are in Nigeria and try again.');
            setShowManualLocation(true);
          }
        } catch (err) {
          setError('Error processing location data. Please try again.');
          console.error('Location error:', err);
          setShowManualLocation(true);
        }
        setGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error code:', error.code, 'message:', error.message);
        setGettingLocation(false);
        setShowManualLocation(true);
        setLocationAttempted(true);

        if (error.code === 1) {
          setError('Location permission denied. Please enable location access and try again.');
        } else if (error.code === 2) {
          setError('Unable to retrieve your location. Please try again or use manual selection.');
        } else if (error.code === 3) {
          setError('Location request timed out. Please try again or use manual selection.');
        } else {
          setError('Unable to access your location. Please use manual selection instead.');
        }
      },
      options
    );
  };

  const progressPercentage = (currentStep / 4) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/get-lawyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      sessionStorage.setItem('userFormData', JSON.stringify(formData));
      router.push('/results');
    } catch (err) {
      setError('Failed to submit form. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-white">
      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[family-name:var(--font-playfair)]">
              Enable Location Access
            </h2>
            <p className="text-gray-600 mb-6 font-[family-name:var(--font-poppins)]">
              To find lawyers near you, we need permission to access your location.
            </p>

            <button
              type="button"
              onClick={() => {
                handleUseLocation();
                setShowLocationModal(false);
              }}
              className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all duration-300 font-[family-name:var(--font-poppins)]"
            >
              ✓ Allow Location Access
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLocationModal(false);
                setShowManualLocation(true);
              }}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300 font-[family-name:var(--font-poppins)]"
            >
              📝 Enter Location Manually
            </button>
          </div>
        </div>
      )}

      {/* Fluid Header */}
      <section className="relative overflow-hidden px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-4">
            <div className="text-sm font-semibold text-red-600 bg-red-100 px-4 py-2 rounded-full font-[family-name:var(--font-poppins)]">
              Step {currentStep} of 4
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-4 italic">
            {currentStep === 1 && "What's your legal need?"}
            {currentStep === 2 && "Where are you located?"}
            {currentStep === 3 && "What's your budget?"}
            {currentStep === 4 && "Review & Submit"}
          </h1>
          <p className="text-lg text-gray-600 font-[family-name:var(--font-poppins)] max-w-2xl">
            {currentStep === 1 && "Help us understand your legal situation so we can find the perfect match."}
            {currentStep === 2 && "We connect you with lawyers across all of Nigeria—tell us where you're based."}
            {currentStep === 3 && "Let's make sure we find lawyers within your budget range."}
            {currentStep === 4 && "Perfect! Let's find your ideal lawyer."}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mt-10">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </section>

      {/* Form Container */}
      <section className="relative overflow-hidden px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
              <p className="text-red-700 font-semibold font-[family-name:var(--font-poppins)]">{error}</p>
            </div>
          )}

          {/* Step 1: Practice Areas */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-2">Practice Areas</h2>
                <p className="text-gray-600 font-[family-name:var(--font-poppins)]">Select one or multiple areas that match your need:</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {practiceAreas.map((area) => (
                  <label
                    key={area}
                    className="group cursor-pointer relative"
                  >
                    <input
                      type="checkbox"
                      checked={formData.practiceAreas.includes(area)}
                      onChange={() => handlePracticeAreaChange(area)}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      formData.practiceAreas.includes(area)
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 bg-white group-hover:border-red-300'
                    }`}>
                      <p className="font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">
                        {formData.practiceAreas.includes(area) ? '✓ ' : ''}{area}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Practice Area Description */}
              {formData.practiceAreas.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-blue-700 font-semibold font-[family-name:var(--font-poppins)]">
                    {formData.practiceAreas.length} area{formData.practiceAreas.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}

              {/* Legal Issue Textarea */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 font-[family-name:var(--font-poppins)]">
                  Describe Your Legal Issue
                </label>
                <textarea
                  name="legalIssue"
                  value={formData.legalIssue}
                  onChange={handleInputChange}
                  placeholder="e.g., My employer has not paid my salary for 3 months..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-[family-name:var(--font-poppins)] focus:border-red-500 focus:outline-none transition-all duration-300"
                  rows={5}
                />
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-2">
                  {showManualLocation ? 'Select Your Location' : 'Detecting Your Location'}
                </h2>
                <p className="text-gray-600 font-[family-name:var(--font-poppins)]">
                  {showManualLocation 
                    ? 'Choose your state and local government area manually.'
                    : 'We use your current location to find lawyers near you.'}
                </p>
              </div>

              {/* Manual Location Selection */}
              {showManualLocation && !gettingLocation ? (
                <div className="space-y-4">
                  {/* State Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 font-[family-name:var(--font-poppins)]">
                      State
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          state: e.target.value,
                          lga: ''
                        }));
                        setError('');
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-[family-name:var(--font-poppins)] focus:border-red-500 focus:outline-none transition-all duration-300"
                    >
                      <option value="">Select a state...</option>
                      {nigerianStates.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  {/* LGA Selection */}
                  {formData.state && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 font-[family-name:var(--font-poppins)]">
                        Local Government Area (LGA)
                      </label>
                      <select
                        name="lga"
                        value={formData.lga}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            lga: e.target.value
                          }));
                          if (e.target.value) {
                            setLocationSuccess(true);
                          }
                          setError('');
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-[family-name:var(--font-poppins)] focus:border-red-500 focus:outline-none transition-all duration-300"
                      >
                        <option value="">Select an LGA...</option>
                        {nigerianLGAData[formData.state]?.lgas.map((lga) => (
                          <option key={lga} value={lga}>{lga}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Success indicator */}
                  {locationSuccess && formData.state && formData.lga && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                      <p className="text-green-700 font-semibold font-[family-name:var(--font-poppins)]">
                        ✓ Location set: {formData.lga}, {formData.state}
                      </p>
                    </div>
                  )}

                  {/* Switch back to auto-detect */}
                  <div className="text-center pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowManualLocation(false);
                        setLocationAttempted(false);
                        setError('');
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm font-[family-name:var(--font-poppins)]"
                    >
                      ← Try automatic location detection
                    </button>
                  </div>
                </div>
              ) : !showManualLocation ? (
                /* Auto Location Detection */
                <>
                  <div className={`p-8 rounded-3xl border-2 transition-all duration-500 ${
                    locationSuccess 
                      ? 'bg-green-50 border-green-300' 
                      : gettingLocation 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'bg-gray-50 border-gray-300'
                  }`}>
                    {gettingLocation ? (
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <h3 className="text-xl font-bold text-blue-700 font-[family-name:var(--font-playfair)] mb-2">
                          Detecting your location...
                        </h3>
                        <p className="text-blue-700 font-[family-name:var(--font-poppins)]">Please allow location access in your browser.</p>
                      </div>
                    ) : locationSuccess && formData.state && formData.lga ? (
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-green-700 font-[family-name:var(--font-playfair)] mb-2">
                          ✓ Location Detected
                        </h3>
                        <p className="text-green-600 font-[family-name:var(--font-poppins)]">{formData.lga}, {formData.state}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setShowLocationModal(true)}
                          className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all duration-300 font-[family-name:var(--font-poppins)]"
                        >
                          📍 Detect My Location
                        </button>
                        <p className="text-gray-600 font-[family-name:var(--font-poppins)] mt-4">We never store your location data. It is only used to match you with nearby lawyers.</p>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Step 3: Budget */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-2">Budget Range</h2>
                <p className="text-gray-600 font-[family-name:var(--font-poppins)]">What's your budget for legal consultation?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { value: 'under-50k', label: 'Under ₦50,000' },
                  { value: '50k-100k', label: '₦50,000 - ₦100,000' },
                  { value: '100k-250k', label: '₦100,000 - ₦250,000' },
                  { value: '250k-plus', label: '₦250,000+' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="group cursor-pointer relative"
                  >
                    <input
                      type="radio"
                      name="budget"
                      value={option.value}
                      checked={formData.budget === option.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      formData.budget === option.value
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 bg-white group-hover:border-red-300'
                    }`}>
                      <p className="font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">
                        {formData.budget === option.value ? '✓ ' : ''}{option.label}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-2">Review Your Details</h2>
                <p className="text-gray-600 font-[family-name:var(--font-poppins)]">Please confirm your information before proceeding:</p>
              </div>

              <div className="space-y-4">
                {/* Review: Practice Areas */}
                <div className="p-4 border-2 border-gray-300 rounded-xl">
                  <p className="text-sm text-gray-600 font-semibold mb-2 font-[family-name:var(--font-poppins)]">Legal Practice Areas</p>
                  <p className="text-gray-900 font-[family-name:var(--font-poppins)]">
                    {formData.practiceAreas.length > 0 ? formData.practiceAreas.join(', ') : 'Not selected'}
                  </p>
                </div>

                {/* Review: Legal Issue */}
                <div className="p-4 border-2 border-gray-300 rounded-xl">
                  <p className="text-sm text-gray-600 font-semibold mb-2 font-[family-name:var(--font-poppins)]">Your Legal Issue</p>
                  <p className="text-gray-900 font-[family-name:var(--font-poppins)]">{formData.legalIssue || 'Not provided'}</p>
                </div>

                {/* Review: Location */}
                <div className="p-4 border-2 border-gray-300 rounded-xl">
                  <p className="text-sm text-gray-600 font-semibold mb-2 font-[family-name:var(--font-poppins)]">Location</p>
                  <p className="text-gray-900 font-[family-name:var(--font-poppins)]">
                    {formData.lga && formData.state ? `${formData.lga}, ${formData.state}` : 'Not set'}
                  </p>
                </div>

                {/* Review: Budget */}
                <div className="p-4 border-2 border-gray-300 rounded-xl">
                  <p className="text-sm text-gray-600 font-semibold mb-2 font-[family-name:var(--font-poppins)]">Budget</p>
                  <p className="text-gray-900 font-[family-name:var(--font-poppins)]">
                    {formData.budget === 'under-50k' && 'Under ₦50,000'}
                    {formData.budget === '50k-100k' && '₦50,000 - ₦100,000'}
                    {formData.budget === '100k-250k' && '₦100,000 - ₦250,000'}
                    {formData.budget === '250k-plus' && '₦250,000+'}
                    {!formData.budget && 'Not selected'}
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                <p className="text-sm text-yellow-800 font-semibold font-[family-name:var(--font-poppins)]">
                  ⚖️ By submitting, you agree that we will match you with lawyers. Your data will be used only for lawyer matching and will not be shared without your consent.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`px-8 py-3 font-bold rounded-xl transition-all duration-300 font-[family-name:var(--font-poppins)] ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              ← Previous
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && formData.practiceAreas.length === 0) {
                    setError('Please select at least one practice area');
                    return;
                  }
                  if (currentStep === 2 && (!formData.state || !formData.lga)) {
                    setError('Please select your state and LGA');
                    return;
                  }
                  if (currentStep === 3 && !formData.budget) {
                    setError('Please select a budget range');
                    return;
                  }
                  setError('');
                  setCurrentStep(currentStep + 1);
                }}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 font-[family-name:var(--font-poppins)]"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 font-[family-name:var(--font-poppins)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : '✓ Submit & Find Lawyers'}
              </button>
            )}
          </div>
        </div>
      </section>
    </form>
  );
}

export default function FormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FormPageContent />
    </Suspense>
  );
}
