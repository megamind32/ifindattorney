'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { determineLocationFromCoordinates } from '@/lib/location-mapping';
import { nigerianLGAData } from '@/lib/nigerian-lgas';

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

  // Auto-detect location when entering Step 2
  useEffect(() => {
    if (currentStep === 2 && !locationAttempted && !locationSuccess) {
      handleUseLocation();
    }
  }, [currentStep, locationAttempted, locationSuccess]);

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

    // Use high accuracy and shorter timeout for faster response
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // Cache location for 1 minute
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
          }
        } catch (err) {
          setError('Error processing location data. Please try again.');
          console.error('Location error:', err);
        }
        setGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access in your browser settings and refresh the page.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable. Please ensure your device has GPS/location services enabled.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out. Please check your internet connection and try again.');
            break;
          default:
            setError('Unable to get your location. Please try again.');
        }
        setGettingLocation(false);
      },
      options
    );
  };

  const nextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      const hasPracticeAreas = formData.practiceAreas.length > 0;
      const hasLegalIssue = formData.legalIssue.trim();
      if (!hasPracticeAreas && !hasLegalIssue) {
        setError('Please either select a practice area or describe your legal issue');
        return;
      }
    } else if (currentStep === 2) {
      if (!locationSuccess || !formData.state || !formData.lga) {
        setError('Please allow location access to continue. We need your location to find nearby lawyers.');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.budget) {
        setError('Please select a budget range');
        return;
      }
    }
    setError('');
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Store form data first (for fallback)
      const agentRequest = {
        state: formData.state,
        lga: formData.lga,
        practiceAreas: formData.practiceAreas.length > 0 ? formData.practiceAreas : ['General Legal Services'],
        budget: formData.budget,
        legalIssue: formData.legalIssue,
      };

      console.log('DEBUG: Form submission - Request:', agentRequest);
      
      // Store request in sessionStorage first (before API call)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('userFormData', JSON.stringify(agentRequest));
        console.log('DEBUG: Form data stored in sessionStorage:', sessionStorage.getItem('userFormData'));
      }

      // Call the AI agent to search for law firms on Google Maps
      console.log('DEBUG: Calling AI agent endpoint...');
      
      const agentResponse = await fetch('/api/search-lawyers-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentRequest),
      });

      if (agentResponse.ok) {
        const agentData = await agentResponse.json();
        console.log('DEBUG: Agent response received:', agentData);
        
        // Update sessionStorage with agent results
        const dataWithResults = {
          ...agentRequest,
          agentResults: agentData,
        };
        
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('userFormData', JSON.stringify(dataWithResults));
          console.log('DEBUG: Form data updated with agent results');
        }
      } else {
        console.warn(`DEBUG: Agent request failed with status ${agentResponse.status}, will use fallback on results page`);
      }

      // Small delay to ensure sessionStorage is written before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to results page (with or without agent results)
      console.log('DEBUG: Navigating to /results');
      window.location.href = '/results'; // Use window.location instead of router.push for more reliable navigation
    } catch (err) {
      console.error('DEBUG: Error during submit:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const progressPercentage = (currentStep / 4) * 100;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 page-transition-enter">
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

      {/* Form Section */}
      <section className="px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Message */}
            {error && (
              <div className="animate-shake bg-red-50 border-2 border-red-300 rounded-2xl p-6">
                <p className="text-red-700 font-[family-name:var(--font-poppins)] font-medium">{error}</p>
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
                      <div className="relative p-4 border-2 border-gray-200 rounded-2xl transition-all duration-300 group-hover:border-red-400 group-hover:bg-red-50 group-hover:shadow-lg"
                           style={{
                             borderColor: formData.practiceAreas.includes(area) ? '#dc2626' : 'currentColor',
                             backgroundColor: formData.practiceAreas.includes(area) ? '#fef2f2' : 'transparent'
                           }}>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg border-2 border-gray-300 flex items-center justify-center transition-all duration-200 group-hover:border-red-400"
                               style={{
                                 borderColor: formData.practiceAreas.includes(area) ? '#dc2626' : 'currentColor',
                                 backgroundColor: formData.practiceAreas.includes(area) ? '#dc2626' : 'transparent'
                               }}>
                            {formData.practiceAreas.includes(area) && (
                              <span className="text-white text-sm">✓</span>
                            )}
                          </div>
                          <span className="font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">{area}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Legal Issue Textarea */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-3">Or describe your issue</h3>
                  <textarea
                    name="legalIssue"
                    value={formData.legalIssue}
                    onChange={handleInputChange}
                    placeholder="Tell us about your legal situation in detail..."
                    rows={5}
                    disabled={formData.practiceAreas.length > 0}
                    className={`w-full px-6 py-4 border-2 rounded-2xl font-[family-name:var(--font-poppins)] font-semibold transition-all duration-300 focus:outline-none resize-none ${
                      formData.practiceAreas.length > 0
                        ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-gray-900'
                    }`}
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
                {showManualLocation ? (
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
                            lga: '' // Reset LGA when state changes
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
                ) : (
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
                          <p className="text-gray-600 font-[family-name:var(--font-poppins)]">
                            Please allow location access when prompted
                          </p>
                        </div>
                      ) : locationSuccess ? (
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-3xl text-white">✓</span>
                          </div>
                          <h3 className="text-xl font-bold text-green-700 font-[family-name:var(--font-playfair)] mb-2">
                            Location Detected!
                          </h3>
                          <div className="bg-white rounded-2xl p-4 mt-4 inline-block">
                            <p className="text-lg font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">
                              📍 {formData.lga}, {formData.state}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-3xl">📍</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-700 font-[family-name:var(--font-playfair)] mb-2">
                            Location Required
                          </h3>
                          <p className="text-gray-600 font-[family-name:var(--font-poppins)] mb-4">
                            Click below to detect your location
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setLocationAttempted(false);
                              handleUseLocation();
                            }}
                            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all duration-300 font-[family-name:var(--font-poppins)]"
                          >
                            📍 Detect My Location
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Retry and Manual Selection buttons (only show if failed) */}
                    {!gettingLocation && !locationSuccess && locationAttempted && (
                      <div className="text-center space-y-4">
                        <button
                          type="button"
                          onClick={() => {
                            setLocationAttempted(false);
                            setError('');
                            handleUseLocation();
                          }}
                          className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300 font-[family-name:var(--font-poppins)] mr-4"
                        >
                          🔄 Try Again
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowManualLocation(true);
                            setError('');
                          }}
                          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-300 font-[family-name:var(--font-poppins)]"
                        >
                          📝 Enter Location Manually
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Location Privacy Notice */}
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
                  <p className="text-sm text-blue-800 font-[family-name:var(--font-poppins)]">
                    <strong>🔒 Privacy:</strong> Your location is only used to find lawyers near you and is not stored permanently.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Budget */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-2">Budget</h2>
                  <p className="text-gray-600 font-[family-name:var(--font-poppins)]">What's your budget range for legal services? (in NGN)</p>
                </div>

                <div className="space-y-3">
                  {[
                    { value: 'Below 50,000', label: 'Below ₦50,000' },
                    { value: '50,000 - 100,000', label: '₦50,000 - ₦100,000' },
                    { value: '100,000 - 250,000', label: '₦100,000 - ₦250,000' },
                    { value: '250,000 - 500,000', label: '₦250,000 - ₦500,000' },
                    { value: '500,000 - 1,000,000', label: '₦500,000 - ₦1,000,000' },
                    { value: 'Above 1,000,000', label: 'Above ₦1,000,000' },
                  ].map((option) => (
                    <label key={option.value} className="group cursor-pointer">
                      <input
                        type="radio"
                        name="budget"
                        value={option.value}
                        checked={formData.budget === option.value}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                        className="sr-only"
                      />
                      <div className="p-4 border-2 border-gray-200 rounded-2xl transition-all duration-300 group-hover:border-red-400 group-hover:bg-red-50 group-hover:shadow-lg"
                           style={{
                             borderColor: formData.budget === option.value ? '#dc2626' : 'currentColor',
                             backgroundColor: formData.budget === option.value ? '#fef2f2' : 'transparent'
                           }}>
                            <span className="font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">{option.label}</span>
                          </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-8 border-2 border-red-200">
                  <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-6">Review Your Details</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-4">
                      <p className="text-sm text-gray-600 font-[family-name:var(--font-poppins)]">Legal Need</p>
                      <p className="font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">
                        {formData.practiceAreas.length > 0 ? formData.practiceAreas.join(', ') : formData.legalIssue || 'Not specified'}
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl p-4">
                      <p className="text-sm text-gray-600 font-[family-name:var(--font-poppins)]">Location</p>
                      <p className="font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">{formData.state}, {formData.lga}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4">
                      <p className="text-sm text-gray-600 font-[family-name:var(--font-poppins)]">Budget</p>
                      <p className="font-semibold text-gray-900 font-[family-name:var(--font-poppins)]">{formData.budget}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 font-[family-name:var(--font-poppins)] text-center">
                  <strong className="text-red-600">Privacy:</strong> Your information will only be used to match you with appropriate lawyers.
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:border-red-600 hover:text-red-600 transition-all duration-300 font-[family-name:var(--font-poppins)]"
                >
                  ← Back
                </button>
              )}
              {currentStep < 4 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-[family-name:var(--font-poppins)]"
                >
                  Next →
                </button>
              )}
              {currentStep === 4 && (
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-2xl transition-all duration-300 font-[family-name:var(--font-poppins)] ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  {loading ? 'Finding Lawyers...' : 'Find My Lawyers →'}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function FormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FormPageContent />
    </Suspense>
  );
}
