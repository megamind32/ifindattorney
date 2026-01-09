'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { getAllStates, getLGAsForState } from '@/lib/nigerian-lgas';
import { determineLocationFromCoordinates, getConfidenceMessage } from '@/lib/location-mapping';

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

const nigerianStates = getAllStates();

function FormPageContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

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

  const handleStateChange = (state: string) => {
    setFormData((prev) => ({
      ...prev,
      state,
      lga: '', // Reset LGA when state changes
    }));
    setLocationSuccess(false);
  };

  const handleUseLocation = async () => {
    setGettingLocation(true);
    setError('');
    setLocationSuccess(false);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setGettingLocation(false);
      return;
    }

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
            setError('Could not determine your location. Please select manually.');
          }
        } catch (err) {
          setError('Error processing location data. Please select manually.');
          console.error('Location error:', err);
        }
        setGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable. Please select manually.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out. Please select manually.');
            break;
          default:
            setError('Unable to get your location. Please select manually.');
        }
        setGettingLocation(false);
      }
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
      if (!formData.state) {
        setError('Please select a state');
        return;
      }
      if (!formData.lga) {
        setError('Please select an LGA');
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
      // Store form data in session/local storage for results page
      const dataToStore = {
        practiceAreas: formData.practiceAreas,
        legalIssue: formData.legalIssue,
        state: formData.state,
        lga: formData.lga,
        budget: formData.budget,
      };
      
      console.log('DEBUG: Storing form data:', dataToStore);
      sessionStorage.setItem('userFormData', JSON.stringify(dataToStore));
      console.log('DEBUG: Form data stored. SessionStorage contents:', sessionStorage.getItem('userFormData'));

      // Navigate to results page
      console.log('DEBUG: Navigating to /results');
      router.push('/results');
    } catch (err) {
      console.error('DEBUG: Error during submit:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const progressPercentage = (currentStep / 4) * 100;
  const availableLGAs = getLGAsForState(formData.state);

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
                  <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-2">Your Location</h2>
                  <p className="text-gray-600 font-[family-name:var(--font-poppins)]">Select your state and Local Government Area (LGA):</p>
                </div>

                {/* Use Location Button */}
                <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    disabled={gettingLocation}
                    className={`w-full py-4 px-6 rounded-2xl font-semibold font-[family-name:var(--font-poppins)] transition-all duration-300 flex items-center justify-center gap-2 ${
                      gettingLocation
                        ? 'bg-blue-300 text-white cursor-not-allowed'
                        : locationSuccess
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {gettingLocation ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Getting your location...
                      </>
                    ) : locationSuccess ? (
                      <>
                        <span>✓</span>
                        Location detected and set!
                      </>
                    ) : (
                      <>
                        <span>📍</span>
                        Use my current location
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-600 font-[family-name:var(--font-poppins)] mt-3 text-center">
                    We'll automatically detect your state and LGA based on your GPS location
                  </p>
                </div>

                {/* State Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 font-[family-name:var(--font-poppins)] mb-3">Nigerian State</label>
                  {locationSuccess && (
                    <div className="mb-3 p-3 bg-green-100 border-l-4 border-green-500 rounded">
                      <p className="text-sm font-semibold text-green-700 font-[family-name:var(--font-poppins)]">
                        ✓ Detected: {formData.state}
                      </p>
                    </div>
                  )}
                  <select
                    value={formData.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-red-300 rounded-2xl font-[family-name:var(--font-poppins)] focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-300 bg-white"
                  >
                    <option value="">Choose a state...</option>
                    {nigerianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* LGA Selection */}
                {formData.state && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 font-[family-name:var(--font-poppins)] mb-3">Local Government Area (LGA) in {formData.state}</label>
                    {locationSuccess && (
                      <div className="mb-3 p-3 bg-green-100 border-l-4 border-green-500 rounded">
                        <p className="text-sm font-semibold text-green-700 font-[family-name:var(--font-poppins)]">
                          ✓ Detected: {formData.lga}
                        </p>
                      </div>
                    )}
                    <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-2xl p-4 bg-gray-50">
                      {availableLGAs.map((lga) => (
                        <label key={lga} className="group cursor-pointer flex items-center">
                          <input
                            type="radio"
                            name="lga"
                            value={lga}
                            checked={formData.lga === lga}
                            onChange={(e) => setFormData({...formData, lga: e.target.value})}
                            className="sr-only"
                          />
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center transition-all duration-200 group-hover:border-red-400"
                               style={{
                                 borderColor: formData.lga === lga ? '#dc2626' : 'currentColor',
                                 backgroundColor: formData.lga === lga ? '#dc2626' : 'transparent'
                               }}>
                            {formData.lga === lga && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="ml-3 font-semibold text-gray-900 font-[family-name:var(--font-poppins)] group-hover:text-red-600">{lga}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 font-[family-name:var(--font-poppins)] mt-2">
                      {availableLGAs.length} Local Government Areas in {formData.state}
                    </p>
                  </div>
                )}
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
