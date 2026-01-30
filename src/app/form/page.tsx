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
  'Labour/Industrial concerns',
  'Family matters',
  'Property matters',
  'Corporate practice',
  'Commercial/Business matters',
  'Alternative dispute resolution',
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

  // Auto-request geolocation when user reaches Step 2
  useEffect(() => {
    if (currentStep === 2 && !locationAttempted && !formData.state) {
      // Only auto-request if permission might be granted
      if (permissionStatus === 'granted' || permissionStatus === 'prompt') {
        // Small delay to ensure UI is ready
        const timer = setTimeout(() => {
          setShowLocationModal(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentStep, locationAttempted, formData.state, permissionStatus]);

  // Monitor Step 4 to prevent auto-submission
  useEffect(() => {
    if (currentStep === 4) {
      console.log('✓ Reached Step 4 (Review & Submit) - Waiting for user to click submit');
      setLoading(false); // Ensure loading is false on Step 4
    }
  }, [currentStep]);

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
    console.log('handleUseLocation called');
    setGettingLocation(true);
    setError('');
    setLocationSuccess(false);
    setLocationAttempted(true);

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      setError('Geolocation is not supported by your browser. Please try using a different browser. Try using Chrome, Safari, Firefox, or Edge.');
      setGettingLocation(false);
      return;
    }

    console.log('Starting geolocation request...');

    // Optimized options for mobile: balance accuracy and speed
    const options = {
      enableHighAccuracy: false,  // Faster on mobile (uses WiFi/cell triangulation)
      timeout: 15000,              // 15 seconds timeout for mobile networks
      maximumAge: 300000           // Cache results for 5 minutes
    };

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✓ Geolocation success, coords:', {lat: position.coords.latitude, lng: position.coords.longitude});
          try {
            const { latitude, longitude } = position.coords;
            const locationMatch = determineLocationFromCoordinates({
              latitude,
              longitude,
            });

            if (locationMatch) {
              console.log('✓ Location matched:', locationMatch);
              setFormData((prev) => ({
                ...prev,
                state: locationMatch.state,
                lga: locationMatch.lga,
              }));
              setLocationSuccess(true);
              setError('');
              setShowLocationModal(false); // Close modal after successful location detection
            } else {
              console.warn('Location coordinates not in Nigeria');
              setError('Could not determine your location within Nigeria. Please ensure you are in Nigeria and try again.');
              setShowManualLocation(true);
            }
          } catch (err) {
            console.error('Error processing location data:', err);
            setError('Error processing location data. Please try again.');
            console.error('Location error:', err);
            setShowManualLocation(true);
          }
          setGettingLocation(false);
        },
        (error) => {
          console.error('❌ Geolocation error code:', error.code, 'message:', error.message);
          setGettingLocation(false);
          setShowManualLocation(true);
          setLocationAttempted(true);

          if (error.code === 1) {
            console.log('Error 1: Permission Denied');
            setError('❌ Location Permission Denied. To fix: Go to your browser settings, find this site in the permissions list, and allow location access. Then reload and try again.');
          } else if (error.code === 2) {
            console.log('Error 2: Position Unavailable');
            setError('❌ Location Service Not Available. This usually means: (1) Location services are disabled on your device, or (2) You\'re in an area without GPS/WiFi signal. Please use manual location selection below, or enable location services in your system settings.');
          } else if (error.code === 3) {
            console.log('Error 3: Timeout');
            setError('❌ Location Request Timed Out (took too long). Please check your internet connection and try again, or use manual selection below.');
          } else {
            console.log('Error: Unknown code', error.code);
            setError('❌ Unable to Access Your Location. Please use the manual location selection below, or reload the page and try again.');
          }
        },
        options
      );
    } catch (outerErr) {
      console.error('Outer error in geolocation request:', outerErr);
      setError('An unexpected error occurred while requesting location. Please try manual selection instead.');
      setGettingLocation(false);
      setShowManualLocation(true);
    }
  };

  const progressPercentage = (currentStep / 4) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔴 Form onSubmit handler triggered - currentStep:', currentStep);
    e.preventDefault();
    e.stopPropagation();
    
    // Only allow submission from Step 4 (Review & Submit)
    if (currentStep !== 4) {
      console.error('❌ BLOCKED: Attempted submission from Step', currentStep, '- Only Step 4 is allowed');
      return;
    }
    
    // Check if already loading to prevent duplicate submissions
    if (loading) {
      console.warn('⚠️ Already loading - preventing duplicate submission attempt');
      return;
    }

    console.log('✅ Valid submission from Step 4 - proceeding with API call');
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

      const agentResults = await response.json();
      
      // Store both form data and agent results
      const completeData = {
        ...formData,
        agentResults,
        timestamp: new Date().toISOString(),
      };
      
      sessionStorage.setItem('userFormData', JSON.stringify(completeData));
      router.push('/results');
    } catch (err) {
      setError('Failed to submit form. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-white" onKeyDown={(e) => {
      // Prevent accidental form submission via Enter key
      if (e.key === 'Enter') {
        if (currentStep !== 4) {
          e.preventDefault();
          e.stopPropagation();
          console.warn('Enter key pressed outside review step - submission prevented');
        }
      }
    }}>
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Allow Location Access button clicked');
                handleUseLocation();
              }}
              disabled={gettingLocation}
              className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all duration-300 font-[family-name:var(--font-poppins)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gettingLocation ? '⏳ Detecting Location...' : '✓ Allow Location Access'}
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
      <section className="relative overflow-hidden px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="inline-block mb-4 md:mb-6">
            <div className="text-xs sm:text-sm md:text-base font-semibold text-red-600 bg-red-100 px-4 py-2 rounded-full font-[family-name:var(--font-poppins)]">
              Step {currentStep} of 4
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-4 md:mb-6 italic">
            {currentStep === 1 && "What's your legal need?"}
            {currentStep === 2 && "Where are you located?"}
            {currentStep === 3 && "What's your budget?"}
            {currentStep === 4 && "Review & Submit"}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 font-[family-name:var(--font-poppins)] max-w-2xl leading-relaxed">
            {currentStep === 1 && "Help us understand your legal situation so we can find the perfect match."}
            {currentStep === 2 && "We connect you with lawyers across all of Nigeria—tell us where you're based."}
            {currentStep === 3 && "Let's make sure we find lawyers within your budget range."}
            {currentStep === 4 && "Perfect! Let's find your ideal lawyer."}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-5xl mx-auto mt-10 md:mt-12">
          <div className="h-2 md:h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </section>

      {/* Form Container */}
      <section className="relative overflow-hidden px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
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
                <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-2 md:mb-3">Legal Area of Concern</h2>
                <p className="text-base md:text-lg text-gray-600 font-[family-name:var(--font-poppins)]">Select one or multiple areas that match your need:</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
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
                    <div className={`p-4 md:p-5 rounded-xl border-2 transition-all duration-300 ${
                      formData.practiceAreas.includes(area)
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 bg-white group-hover:border-red-300'
                    }`}>
                      <p className="font-semibold text-gray-900 text-sm md:text-base font-[family-name:var(--font-poppins)]">
                        {formData.practiceAreas.includes(area) ? '✓ ' : ''}{area}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Practice Area Description */}
              {formData.practiceAreas.length > 0 && (
                <div className="p-4 md:p-5 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-blue-700 font-semibold text-sm md:text-base font-[family-name:var(--font-poppins)]">
                    {formData.practiceAreas.length} area{formData.practiceAreas.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}

              {/* Legal Issue Textarea */}
              <div>
                <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-2 md:mb-3 font-[family-name:var(--font-poppins)]">
                  Describe Your Legal Issue
                </label>
                <textarea
                  name="legalIssue"
                  value={formData.legalIssue}
                  onChange={handleInputChange}
                  placeholder="e.g., My employer has not paid my salary for 3 months..."
                  className="w-full px-4 md:px-5 py-3 md:py-4 border-2 border-gray-700 rounded-xl font-[family-name:var(--font-poppins)] bg-white text-black placeholder-gray-500 focus:border-red-600 focus:ring-2 focus:ring-red-200 focus:outline-none transition-all duration-300 shadow-md hover:border-gray-800 text-sm md:text-base"
                  rows={5}
                />
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-2 md:mb-3">
                  {showManualLocation ? 'Select Your Location' : 'Detecting Your Location'}
                </h2>
                <p className="text-base md:text-lg text-gray-600 font-[family-name:var(--font-poppins)]">
                  {showManualLocation 
                    ? 'Choose your state and local government area manually.'
                    : 'We use your current location to find lawyers near you.'}
                </p>
              </div>

              {/* Manual Location Selection */}
              {showManualLocation && !gettingLocation ? (
                <div className="space-y-4 md:space-y-5">
                  {/* State Selection */}
                  <div>
                    <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-2 md:mb-3 font-[family-name:var(--font-poppins)]">
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
                      className="w-full px-4 md:px-5 py-3 md:py-4 border-2 border-gray-700 rounded-xl font-[family-name:var(--font-poppins)] bg-white text-black focus:border-red-600 focus:ring-2 focus:ring-red-200 focus:outline-none transition-all duration-300 shadow-md hover:border-gray-800 cursor-pointer text-sm md:text-base"
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
                      <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-2 md:mb-3 font-[family-name:var(--font-poppins)]">
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
                        className="w-full px-4 md:px-5 py-3 md:py-4 border-2 border-gray-700 rounded-xl font-[family-name:var(--font-poppins)] bg-white text-black focus:border-red-600 focus:ring-2 focus:ring-red-200 focus:outline-none transition-all duration-300 shadow-md hover:border-gray-800 cursor-pointer text-sm md:text-base"
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
                    <div className="p-4 md:p-5 bg-green-50 border border-green-200 rounded-xl text-center">
                      <p className="text-green-700 font-semibold text-sm md:text-base font-[family-name:var(--font-poppins)]">
                        ✓ Location set: {formData.lga}, {formData.state}
                      </p>
                    </div>
                  )}

                  {/* Switch back to auto-detect */}
                  <div className="text-center pt-4 md:pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowManualLocation(false);
                        setLocationAttempted(false);
                        setError('');
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-xs sm:text-sm md:text-base font-[family-name:var(--font-poppins)]"
                    >
                      ← Try automatic location detection
                    </button>
                  </div>
                </div>
              ) : !showManualLocation ? (
                /* Auto Location Detection */
                <>
                  <div className={`p-6 md:p-8 rounded-3xl border-2 transition-all duration-500 ${
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
                <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-2 md:mb-3">Budget Range</h2>
                <p className="text-base md:text-lg text-gray-600 font-[family-name:var(--font-poppins)]">What's your budget for legal consultation?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
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
                    <div className={`p-4 md:p-5 rounded-xl border-2 transition-all duration-300 ${
                      formData.budget === option.value
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 bg-white group-hover:border-red-300'
                    }`}>
                      <p className="font-semibold text-gray-900 text-sm md:text-base font-[family-name:var(--font-poppins)]">
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
          <div className="flex flex-col sm:flex-row justify-between gap-4 md:gap-6 mt-12 md:mt-16">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`px-6 sm:px-8 py-3 md:py-4 font-bold rounded-xl transition-all duration-300 font-[family-name:var(--font-poppins)] text-sm md:text-base ${
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
                className="px-6 sm:px-8 py-3 md:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 font-[family-name:var(--font-poppins)] text-sm md:text-base"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                onClick={(e) => {
                  console.log('✓ Submit button clicked explicitly by user - currentStep:', currentStep, 'loading:', loading);
                  if (loading) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                  if (currentStep !== 4) {
                    console.error('ERROR: Submit button clicked from Step', currentStep, '- blocking submission');
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                className="px-6 sm:px-8 py-3 md:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 font-[family-name:var(--font-poppins)] disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
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
