'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Lawyer {
  firmName: string;
  contactPerson?: string;
  location: string;
  website?: string;
  practiceAreas?: string[];
  phone?: string;
  address?: string;
  email?: string;
  matchScore?: number;
  matchReason?: string;
  isExactMatch?: boolean;
  latitude?: number;
  longitude?: number;
  distance?: number;
  matchTier?: string;
  gmapsUrl?: string;
  directionsUrl?: string;
  rating?: number;
  reviewCount?: number;
  source?: string;
}

interface ResultsData {
  success: boolean;
  legalIssue?: string;
  preferredLocation?: string;
  state?: string;
  lga?: string;
  practiceArea?: string;
  selectedPracticeAreas?: string[];
  budget?: string;
  exactMatchesFound?: number;
  alternativesFound?: number;
  matchingStrategy?: string;
  strategyDetails?: string;
  matchingTier?: string;
  exactMatches?: Lawyer[];
  alternatives?: Lawyer[];
  recommendations?: Lawyer[];
  totalRecommendations?: number;
  // Google Maps API response format
  resultsFound?: number;
  guaranteedResults?: boolean;
  results?: Lawyer[];
  source?: string;
  message?: string;
  searchCriteria?: {
    practiceArea: string;
    location: string;
    state: string;
    lga: string;
  };
}

function ResultsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trackingLawyer, setTrackingLawyer] = useState<Lawyer | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleTrackLawFirm = (lawyer: Lawyer) => {
    if (!lawyer.latitude || !lawyer.longitude) {
      alert('Law firm location data not available');
      return;
    }
    setTrackingLawyer(lawyer);
    setShowMapModal(true);
  };

  const handleGetDirections = async () => {
    if (!trackingLawyer?.latitude || !trackingLawyer?.longitude) return;

    setGettingLocation(true);
    // Request user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          // Open Google Maps with directions
          const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${trackingLawyer.latitude},${trackingLawyer.longitude}&travelmode=driving`;
          window.open(googleMapsUrl, '_blank');
          
          setShowMapModal(false);
          setTrackingLawyer(null);
          setGettingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback: Open Google Maps without user location
          const googleMapsUrl = `https://www.google.com/maps/search/${trackingLawyer.latitude},${trackingLawyer.longitude}`;
          window.open(googleMapsUrl, '_blank');
          setShowMapModal(false);
          setTrackingLawyer(null);
          setGettingLocation(false);
        }
      );
    }
  };

  const handleViewOnMap = () => {
    if (!trackingLawyer?.latitude || !trackingLawyer?.longitude) return;
    
    const googleMapsUrl = `https://www.google.com/maps/search/${trackingLawyer.latitude},${trackingLawyer.longitude}`;
    window.open(googleMapsUrl, '_blank');
    setShowMapModal(false);
    setTrackingLawyer(null);
  };

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        setError('');

        // Get form data from session storage
        const formDataStr = sessionStorage.getItem('userFormData');
        console.log('DEBUG: Retrieved from sessionStorage:', formDataStr);
        
        if (!formDataStr) {
          console.error('DEBUG: No form data found in sessionStorage');
          setError('Form data not found. Please fill the form again.');
          setLoading(false);
          return;
        }

        const formData = JSON.parse(formDataStr);
        console.log('DEBUG: Parsed form data:', formData);

        // Call the AI Agent to search Google Maps for law firms
        console.log('DEBUG: Triggering AI Agent to search Google Maps with:', formData);
        const response = await fetch('/api/search-lawyers-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          console.error('DEBUG: API response not OK:', response.status, response.statusText);
          throw new Error('Failed to fetch lawyers');
        }

        const data: ResultsData = await response.json();
        console.log('DEBUG: API Response received:', data);
        console.log('DEBUG: exactMatches:', data.exactMatches);
        console.log('DEBUG: alternatives:', data.alternatives);
        console.log('DEBUG: recommendations:', data.recommendations);
        setResults(data);

        // Clear session storage after successful fetch
        sessionStorage.removeItem('userFormData');
      } catch (err) {
        console.error('DEBUG: Error in fetch:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-lg font-[family-name:var(--font-inter)] text-gray-700">
              Searching for the best lawyers for your case...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              We're analyzing law firms in your preferred location
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white page-transition-enter">
        <section className="border-b border-black/10 px-4 sm:px-6 py-6 sm:py-8 bg-white content-transition">
          <div className="max-w-4xl mx-auto">
            <Link href="/">
              <button className="text-red-600 hover:text-red-700 font-semibold text-sm mb-4">
                ← Back to Home
              </button>
            </Link>
            <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded">
              <h2 className="text-xl font-bold font-[family-name:var(--font-khand)] text-red-700 mb-2">
                Error Retrieving Results
              </h2>
              <p className="text-gray-700 font-[family-name:var(--font-inter)]">
                {error}
              </p>
              <button
                onClick={() => router.push('/form')}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Try Again
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!results) {
    return (
      <main className="min-h-screen bg-white page-transition-enter">
        <section className="border-b border-black/10 px-4 sm:px-6 py-6 sm:py-8 bg-white content-transition">
          <div className="max-w-4xl mx-auto">
            <Link href="/">
              <button className="text-red-600 hover:text-red-700 font-semibold text-sm mb-4">
                ← Back to Home
              </button>
            </Link>
            <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded">
              <h2 className="text-xl font-bold font-[family-name:var(--font-khand)] text-amber-700 mb-2">
                No Results Found
              </h2>
              <p className="text-gray-700 font-[family-name:var(--font-inter)] mb-4">
                We couldn't find lawyers matching your criteria. This might happen if:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1 font-[family-name:var(--font-inter)]">
                <li>The location you selected is not yet in our system</li>
                <li>The practice area is very specialized</li>
                <li>Your session data was lost</li>
              </ul>
              <button
                onClick={() => router.push('/form')}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-semibold"
              >
                Search Again
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-red-600 text-white px-4 sm:px-6 py-8 sm:py-12 content-transition">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <button className="text-red-100 hover:text-white font-semibold text-sm mb-4">
              ← Back to Home
            </button>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-khand)] mb-2">
            Recommended Lawyers
          </h1>
          <p className="text-red-100 font-[family-name:var(--font-inter)]">
            Based on your legal issue and location preferences
          </p>
        </div>
      </section>

      {/* Results Summary */}
      <section className="px-4 sm:px-6 py-8 page-transition-enter">
        <div className="max-w-4xl mx-auto">
          {/* Matching Strategy Banner (Old Format) */}
          {results.matchingStrategy && (
            <div className={`rounded-lg p-6 mb-8 border-l-4 ${
              results.matchingTier === 'tier1' ? 'bg-green-50 border-green-600' :
              results.matchingTier === 'tier2' ? 'bg-blue-50 border-blue-600' :
              results.matchingTier === 'tier3' ? 'bg-amber-50 border-amber-600' :
              'bg-purple-50 border-purple-600'
            }`}>
              <h2 className={`text-lg font-bold font-[family-name:var(--font-khand)] mb-2 ${
                results.matchingTier === 'tier1' ? 'text-green-700' :
                results.matchingTier === 'tier2' ? 'text-blue-700' :
                results.matchingTier === 'tier3' ? 'text-amber-700' :
                'text-purple-700'
              }`}>
                {results.matchingStrategy}
              </h2>
              <p className={`text-sm font-[family-name:var(--font-inter)] ${
                results.matchingTier === 'tier1' ? 'text-green-700' :
                results.matchingTier === 'tier2' ? 'text-blue-700' :
                results.matchingTier === 'tier3' ? 'text-amber-700' :
                'text-purple-700'
              }`}>
                {results.strategyDetails}
              </p>
            </div>
          )}

          {/* Google Maps Results Header */}
          {(results.source === 'google_maps_places_api' || results.source === 'mock_data_fallback') && (
            <div className={`rounded-lg p-6 mb-8 border-l-4 ${results.source === 'google_maps_places_api' ? 'bg-blue-50 border-blue-600' : 'bg-purple-50 border-purple-600'}`}>
              <h2 className={`text-lg font-bold font-[family-name:var(--font-khand)] mb-2 ${results.source === 'google_maps_places_api' ? 'text-blue-700' : 'text-purple-700'}`}>
                📍 {results.source === 'google_maps_places_api' ? 'Real-time Results from Google Maps' : 'Law Firm Recommendations'}
              </h2>
              <p className={`text-sm font-[family-name:var(--font-inter)] ${results.source === 'google_maps_places_api' ? 'text-blue-700' : 'text-purple-700'}`}>
                {results.message || `Found ${results.resultsFound} law firm(s) matching your search`}
              </p>
            </div>
          )}

          {/* Case Summary (Old Format) */}
          {results.state && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 content-transition">
              <h2 className="text-lg font-bold font-[family-name:var(--font-khand)] text-gray-800 mb-4">
                Your Case Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                    Legal Issue
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {results.practiceArea || 'Legal Services'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                    Location
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {results.lga ? `${results.lga}, ${results.state}` : results.state}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                    Results Found
                  </p>
                  <p className="text-lg font-semibold text-red-600 mt-1">
                    {(results.totalRecommendations || results.resultsFound || 0)} Firm{((results.totalRecommendations || results.resultsFound || 0) !== 1 ? 's' : '')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Notes */}
          {results.exactMatchesFound > 0 && results.alternativesFound > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-8">
              <p className="text-sm text-blue-700 font-[family-name:var(--font-inter)]">
                <strong>Alternative Options:</strong> In addition to your exact matches, we found {results.alternativesFound} additional firm{results.alternativesFound !== 1 ? 's' : ''} nearby or with similar expertise that may also suit your needs.
              </p>
            </div>
          )}

          {results.exactMatchesFound === 0 && results.alternativesFound > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded mb-8">
              <p className="text-sm text-amber-700 font-[family-name:var(--font-inter)]">
                <strong>No exact specialists in your location:</strong> We found {results.alternativesFound} firm{results.alternativesFound !== 1 ? 's' : ''} nearby or with broader practice areas that can help with your case. These may be in adjacent locations or offer general legal services.
              </p>
            </div>
          )}

          {/* Google Maps Results Section */}
          {(results.source === 'google_maps_places_api' || results.source === 'mock_data_fallback') && results.results && results.results.length > 0 && (
            <div className="space-y-6 mb-12">
              <div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-khand)] text-gray-800">
                  Available Law Firms
                </h2>
                <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)] mt-2">
                  {results.source === 'google_maps_places_api' ? 'Found via Google Maps • Updated in real-time' : 'Recommended for your case'}
                </p>
              </div>
              {results.results.map((lawyer, idx) => (
                <div
                  key={idx}
                  className="bg-white border-2 border-blue-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  {/* Lawyer Card Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-blue-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold font-[family-name:var(--font-khand)] text-gray-900">
                          {lawyer.firmName}
                        </h3>
                        <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)] mt-1">
                          {lawyer.location}
                        </p>
                        {lawyer.distance && (
                          <p className="text-xs text-blue-600 font-[family-name:var(--font-inter)] mt-1">
                            📍 {lawyer.distance.toFixed(1)}km away
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {lawyer.rating && (
                          <div className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold mb-2">
                            ★ {lawyer.rating.toFixed(1)} ({lawyer.reviewCount} reviews)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lawyer Card Body */}
                  <div className="px-6 py-4 space-y-4">
                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">
                        Contact Details
                      </p>
                      <div className="space-y-2 text-sm font-[family-name:var(--font-inter)]">
                        {lawyer.address && (
                          <p>
                            <strong className="text-gray-700">Address:</strong>{' '}
                            <span className="text-gray-600">{lawyer.address}</span>
                          </p>
                        )}
                        {lawyer.phone && (
                          <p>
                            <strong className="text-gray-700">Phone:</strong>{' '}
                            <a href={`tel:${lawyer.phone}`} className="text-blue-600 hover:text-blue-700 font-semibold">
                              {lawyer.phone}
                            </a>
                          </p>
                        )}
                        {lawyer.website && (
                          <p>
                            <strong className="text-gray-700">Website:</strong>{' '}
                            <a
                              href={lawyer.website.startsWith('http') ? lawyer.website : `https://${lawyer.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 font-semibold break-all"
                            >
                              Visit Website →
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lawyer Card Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 flex-wrap">
                    {lawyer.phone && (
                      <a
                        href={`tel:${lawyer.phone}`}
                        className="flex-1 min-w-[150px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-center text-sm"
                      >
                        Call Now
                      </a>
                    )}
                    {lawyer.gmapsUrl && (
                      <a
                        href={lawyer.gmapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[150px] px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-bold text-center text-sm"
                      >
                        View on Google Maps
                      </a>
                    )}
                    {lawyer.directionsUrl && (
                      <a
                        href={lawyer.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[150px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-center text-sm"
                      >
                        Get Directions
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Exact Matches Section (Old Format) */}
          {results.exactMatches && results.exactMatches.length > 0 ? (
            <div className="space-y-6 mb-12">
              <div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-khand)] text-gray-800">
                  ✓ Exact Matches in Your Location
                </h2>
                <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)] mt-2">
                  These are specialists in {results.practiceArea} right where you need them.
                </p>
              </div>
              {results.exactMatches.map((lawyer, idx) => (
                <div
                  key={idx}
                  className="bg-white border-2 border-green-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  {/* Lawyer Card Header */}
                  <div className="bg-gradient-to-r from-green-50 to-white px-6 py-4 border-b border-green-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold font-[family-name:var(--font-khand)] text-gray-900">
                          {lawyer.firmName}
                        </h3>
                        <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)] mt-1">
                          {lawyer.location} • Contact: {lawyer.contactPerson}
                        </p>
                        {lawyer.distance && (
                          <p className="text-xs text-green-600 font-[family-name:var(--font-inter)] mt-1">
                            📍 {lawyer.distance.toFixed(1)}km from your location
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                          ✓ Exact Match
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lawyer Card Body */}
                  <div className="px-6 py-4 space-y-4">
                    {/* Practice Areas */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                        Specializations
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {lawyer.practiceAreas.map((area) => (
                          <span
                            key={area}
                            className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Match Reason */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                        Why They Match
                      </p>
                      <p className="text-sm text-gray-700 font-[family-name:var(--font-inter)]">
                        {lawyer.matchReason}
                      </p>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">
                        Contact Details
                      </p>
                      <div className="space-y-2 text-sm font-[family-name:var(--font-inter)]">
                        {lawyer.address && (
                          <p>
                            <strong className="text-gray-700">Address:</strong>{' '}
                            <span className="text-gray-600">{lawyer.address}</span>
                          </p>
                        )}
                        {lawyer.phone && (
                          <p>
                            <strong className="text-gray-700">Phone:</strong>{' '}
                            <a href={`tel:${lawyer.phone}`} className="text-green-600 hover:text-green-700 font-semibold">
                              {lawyer.phone}
                            </a>
                          </p>
                        )}
                        {lawyer.email && (
                          <p>
                            <strong className="text-gray-700">Email:</strong>{' '}
                            <a href={`mailto:${lawyer.email}`} className="text-green-600 hover:text-green-700 font-semibold break-all">
                              {lawyer.email}
                            </a>
                          </p>
                        )}
                        {lawyer.website && (
                          <p>
                            <strong className="text-gray-700">Website:</strong>{' '}
                            <a
                              href={lawyer.website.startsWith('http') ? lawyer.website : `https://${lawyer.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700 font-semibold break-all"
                            >
                              {lawyer.website} →
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lawyer Card Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 flex-wrap">
                    {lawyer.phone && (
                      <a
                        href={`tel:${lawyer.phone}`}
                        className="flex-1 min-w-[150px] px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold text-center text-sm"
                      >
                        Call Now
                      </a>
                    )}
                    {lawyer.email && (
                      <a
                        href={`mailto:${lawyer.email}?subject=Legal Consultation Inquiry`}
                        className="flex-1 min-w-[150px] px-4 py-2 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition font-bold text-center text-sm"
                      >
                        Send Email
                      </a>
                    )}
                    {lawyer.latitude && lawyer.longitude && (
                      <button
                        onClick={() => handleTrackLawFirm(lawyer)}
                        disabled={showMapModal}
                        className="flex-1 min-w-[150px] px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Track on Maps
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Alternatives Section - Display all non-exact-match results */}
          {results.alternatives && results.alternatives.length > 0 && (
            <div className="space-y-6 mb-12">
              <div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-khand)] text-gray-800">
                  {results.exactMatchesFound > 0 
                    ? 'Additional Recommended Firms' 
                    : 'Recommended Law Firms'}
                </h2>
                <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)] mt-2">
                  {results.exactMatchesFound > 0 
                    ? `Found ${results.alternativesFound} alternative option${results.alternativesFound !== 1 ? 's' : ''} that may also be suitable for your case.`
                    : `Found ${results.alternativesFound} law firm${results.alternativesFound !== 1 ? 's' : ''} that can assist with your matter.`}
                </p>
              </div>
              {results.alternatives.map((lawyer, idx) => {
                // Determine tier color based on matchTier
                let tierColor = '#d1d5db'; // gray
                let tierBgColor = 'bg-gray-100 text-gray-800';
                let tierButtonColor = 'bg-gray-600 hover:bg-gray-700';
                let tierBorderColor = 'border-gray-200';
                let tierLabel = 'Alternative';

                if (lawyer.matchTier?.includes('TIER 2')) {
                  tierColor = '#3b82f6'; // blue
                  tierBgColor = 'bg-blue-100 text-blue-800';
                  tierButtonColor = 'bg-blue-600 hover:bg-blue-700';
                  tierBorderColor = 'border-blue-200';
                  tierLabel = 'Nearby Specialist';
                } else if (lawyer.matchTier?.includes('TIER 3')) {
                  tierColor = '#f59e0b'; // amber
                  tierBgColor = 'bg-amber-100 text-amber-800';
                  tierButtonColor = 'bg-amber-600 hover:bg-amber-700';
                  tierBorderColor = 'border-amber-200';
                  tierLabel = 'Regional Specialist';
                } else if (lawyer.matchTier?.includes('TIER 4')) {
                  tierColor = '#a855f7'; // purple
                  tierBgColor = 'bg-purple-100 text-purple-800';
                  tierButtonColor = 'bg-purple-600 hover:bg-purple-700';
                  tierBorderColor = 'border-purple-200';
                  tierLabel = 'General Practice';
                } else if (lawyer.matchTier?.includes('TIER 5')) {
                  tierColor = '#8b5cf6'; // violet
                  tierBgColor = 'bg-violet-100 text-violet-800';
                  tierButtonColor = 'bg-violet-600 hover:bg-violet-700';
                  tierBorderColor = 'border-violet-200';
                  tierLabel = 'Available Firm';
                }

                return (
                  <div
                    key={idx}
                    className={`bg-white border rounded-lg overflow-hidden hover:shadow-lg transition border-2 ${tierBorderColor}`}
                  >
                    {/* Lawyer Card Header */}
                    <div className="bg-gradient-to-r px-6 py-4 border-b" style={{
                      backgroundImage: `linear-gradient(to right, rgba(${
                        tierColor === '#3b82f6' ? '59,130,246' :
                        tierColor === '#f59e0b' ? '245,158,11' :
                        tierColor === '#a855f7' ? '168,85,247' :
                        tierColor === '#8b5cf6' ? '139,92,246' :
                        '209,213,219'
                      }, 0.1), white)`,
                      borderColor: tierColor
                    }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold font-[family-name:var(--font-khand)] text-gray-900">
                            {lawyer.firmName}
                          </h3>
                          <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)] mt-1">
                            {lawyer.location} • Contact: {lawyer.contactPerson}
                          </p>
                          {lawyer.distance && (
                            <p className="text-xs text-gray-500 font-[family-name:var(--font-inter)] mt-1">
                              📍 {lawyer.distance.toFixed(1)}km away
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`inline-block ${tierBgColor} px-3 py-1 rounded-full text-sm font-bold`}>
                            {tierLabel}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lawyer Card Body */}
                    <div className="px-6 py-4 space-y-4">
                      {/* Practice Areas */}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                          Specializations
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {lawyer.practiceAreas.map((area) => (
                            <span
                              key={area}
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${tierBgColor}`}
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Match Reason */}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                          Why They May Help
                        </p>
                        <p className="text-sm text-gray-700 font-[family-name:var(--font-inter)]">
                          {lawyer.matchReason}
                        </p>
                      </div>

                      {/* Contact Information */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">
                          Contact Details
                        </p>
                        <div className="space-y-2 text-sm font-[family-name:var(--font-inter)]">
                          {lawyer.address && (
                            <p>
                              <strong className="text-gray-700">Address:</strong>{' '}
                              <span className="text-gray-600">{lawyer.address}</span>
                            </p>
                          )}
                          {lawyer.phone && (
                            <p>
                              <strong className="text-gray-700">Phone:</strong>{' '}
                              <a href={`tel:${lawyer.phone}`} style={{ color: tierColor }} className="hover:opacity-75 font-semibold">
                                {lawyer.phone}
                              </a>
                            </p>
                          )}
                          {lawyer.email && (
                            <p>
                              <strong className="text-gray-700">Email:</strong>{' '}
                              <a href={`mailto:${lawyer.email}`} style={{ color: tierColor }} className="hover:opacity-75 font-semibold break-all">
                                {lawyer.email}
                              </a>
                            </p>
                          )}
                          {lawyer.website && (
                            <p>
                              <strong className="text-gray-700">Website:</strong>{' '}
                              <a
                                href={lawyer.website.startsWith('http') ? lawyer.website : `https://${lawyer.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: tierColor }}
                                className="hover:opacity-75 font-semibold break-all"
                              >
                                {lawyer.website} →
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lawyer Card Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 flex-wrap">
                      {lawyer.phone && (
                        <a
                          href={`tel:${lawyer.phone}`}
                          className={`flex-1 min-w-[150px] px-4 py-2 text-white rounded-lg transition font-bold text-center text-sm ${tierButtonColor}`}
                        >
                          Call Now
                        </a>
                      )}
                      {lawyer.email && (
                        <a
                          href={`mailto:${lawyer.email}?subject=Legal Consultation Inquiry`}
                          className={`flex-1 min-w-[150px] px-4 py-2 rounded-lg hover:bg-gray-100 transition font-bold text-center text-sm border-2`}
                          style={{ borderColor: tierColor, color: tierColor }}
                        >
                          Send Email
                        </a>
                      )}
                      {lawyer.latitude && lawyer.longitude && (
                        <button
                          onClick={() => handleTrackLawFirm(lawyer)}
                          disabled={showMapModal}
                          className={`flex-1 min-w-[150px] px-4 py-2 text-white rounded-lg transition font-bold text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed ${tierButtonColor}`}
                        >
                          Track on Maps
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Fallback: Display All Recommendations when no exact matches/alternatives */}
          {(!results.exactMatches || results.exactMatches.length === 0) && 
           (!results.alternatives || results.alternatives.length === 0) && 
           results.recommendations && results.recommendations.length > 0 ? (
            <div className="space-y-6 mb-12">
              <div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-khand)] text-gray-800">
                  Available Law Firms
                </h2>
                <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)] mt-2">
                  {results.matchingStrategy && results.strategyDetails 
                    ? `${results.strategyDetails}`
                    : 'We found experienced law firms that can assist with your legal matter.'}
                </p>
              </div>
              {results.recommendations.map((lawyer, idx) => {
                const isGeneralMatch = lawyer.matchTier && lawyer.matchTier.includes('TIER 4');
                const tierColor = isGeneralMatch ? 'purple' : 'blue';
                const tierBgColor = isGeneralMatch ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
                const tierButtonColor = isGeneralMatch ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700';
                const tierBorderColor = isGeneralMatch ? 'border-purple-200' : 'border-blue-200';
                
                return (
                  <div
                    key={idx}
                    className={`bg-white border rounded-lg overflow-hidden hover:shadow-lg transition`}
                    style={{ borderColor: tierColor === 'purple' ? '#ddd6fe' : '#bfdbfe' }}
                  >
                    {/* Lawyer Card Header */}
                    <div className={`bg-gradient-to-r px-6 py-4 border-b`} style={{ 
                      backgroundImage: tierColor === 'purple' 
                        ? 'linear-gradient(to right, #f3f0ff, white)'
                        : 'linear-gradient(to right, #eff6ff, white)',
                      borderColor: tierColor === 'purple' ? '#e5d4ff' : '#bfdbfe'
                    }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold font-[family-name:var(--font-khand)] text-gray-900">
                            {lawyer.firmName}
                          </h3>
                          <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)] mt-1">
                            {lawyer.location} • Contact: {lawyer.contactPerson}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`inline-block ${tierBgColor} px-3 py-1 rounded-full text-sm font-bold`}>
                            {isGeneralMatch ? 'General Practice' : 'Available'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lawyer Card Body */}
                    <div className="px-6 py-4 space-y-4">
                      {/* Practice Areas */}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                          Specializations
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {lawyer.practiceAreas.map((area) => (
                            <span
                              key={area}
                              className={isGeneralMatch 
                                ? 'inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold'
                                : 'inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold'}
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Match Reason */}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                          Why They Can Help
                        </p>
                        <p className="text-sm text-gray-700 font-[family-name:var(--font-inter)]">
                          {lawyer.matchReason || 'This law firm can assist with your legal matter.'}
                        </p>
                      </div>

                      {/* Contact Information */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">
                          Contact Details
                        </p>
                        <div className="space-y-2 text-sm font-[family-name:var(--font-inter)]">
                          {lawyer.address && (
                            <p>
                              <strong className="text-gray-700">Address:</strong>{' '}
                              <span className="text-gray-600">{lawyer.address}</span>
                            </p>
                          )}
                          {lawyer.phone && (
                            <p>
                              <strong className="text-gray-700">Phone:</strong>{' '}
                              <a href={`tel:${lawyer.phone}`} className={isGeneralMatch ? 'text-purple-600 hover:text-purple-700 font-semibold' : 'text-blue-600 hover:text-blue-700 font-semibold'}>
                                {lawyer.phone}
                              </a>
                            </p>
                          )}
                          {lawyer.email && (
                            <p>
                              <strong className="text-gray-700">Email:</strong>{' '}
                              <a href={`mailto:${lawyer.email}`} className={isGeneralMatch ? 'text-purple-600 hover:text-purple-700 font-semibold break-all' : 'text-blue-600 hover:text-blue-700 font-semibold break-all'}>
                                {lawyer.email}
                              </a>
                            </p>
                          )}
                          {lawyer.website && (
                            <p>
                              <strong className="text-gray-700">Website:</strong>{' '}
                              <a
                                href={lawyer.website.startsWith('http') ? lawyer.website : `https://${lawyer.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={isGeneralMatch ? 'text-purple-600 hover:text-purple-700 font-semibold break-all' : 'text-blue-600 hover:text-blue-700 font-semibold break-all'}
                              >
                                {lawyer.website} →
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lawyer Card Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 flex-wrap">
                      {lawyer.phone && (
                        <a
                          href={`tel:${lawyer.phone}`}
                          className={`flex-1 min-w-[150px] px-4 py-2 text-white rounded-lg transition font-bold text-center text-sm ${tierButtonColor}`}
                        >
                          Call Now
                        </a>
                      )}
                      {lawyer.email && (
                        <a
                          href={`mailto:${lawyer.email}?subject=Legal Consultation Inquiry`}
                          className={`flex-1 min-w-[150px] px-4 py-2 rounded-lg hover:bg-gray-100 transition font-bold text-center text-sm`}
                          style={{
                            border: `2px solid ${tierColor === 'purple' ? '#c084fc' : '#60a5fa'}`,
                            color: tierColor === 'purple' ? '#a855f7' : '#3b82f6'
                          }}
                        >
                          Send Email
                        </a>
                      )}
                      {lawyer.latitude && lawyer.longitude && (
                        <button
                          onClick={() => handleTrackLawFirm(lawyer)}
                          disabled={showMapModal}
                          className={`flex-1 min-w-[150px] px-4 py-2 text-white rounded-lg transition font-bold text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed ${tierButtonColor}`}
                        >
                          Track on Maps
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* ABSOLUTE FALLBACK: If we have recommendations but nothing was displayed */}
          {((!results.exactMatches || results.exactMatches.length === 0) && 
            (!results.alternatives || results.alternatives.length === 0) && 
            (!results.recommendations || results.recommendations.length === 0)) &&
           results.totalRecommendations > 0 ? (
            <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded">
              <h2 className="text-xl font-bold font-[family-name:var(--font-khand)] text-green-700 mb-2">
                ✓ Law Firms Available
              </h2>
              <p className="text-gray-700 font-[family-name:var(--font-inter)] mb-4">
                We found {results.totalRecommendations} law firm{results.totalRecommendations !== 1 ? 's' : ''} that can assist with your legal matter. 
                Please try searching again or contact our support team for more information.
              </p>
              <button
                onClick={() => router.push('/form')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Search Again
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {/* Map Modal */}
      {showMapModal && trackingLawyer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            {/* Modal Header */}
            <div className="bg-red-600 text-white px-6 py-4 border-b border-red-200">
              <h3 className="text-lg font-bold font-[family-name:var(--font-khand)]">
                {trackingLawyer.firmName}
              </h3>
              <p className="text-sm text-red-100 font-[family-name:var(--font-inter)]">
                {trackingLawyer.location}
              </p>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <p className="text-sm text-gray-700 font-[family-name:var(--font-inter)] mb-6">
                How would you like to view this law firm's location?
              </p>

              <div className="space-y-3">
                {/* View on Map Button - No Location Request */}
                <button
                  onClick={handleViewOnMap}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold text-sm"
                >
                  View on Map
                </button>

                {/* Get Directions Button - With Location Request */}
                <button
                  onClick={handleGetDirections}
                  disabled={gettingLocation}
                  className="w-full px-4 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {gettingLocation ? 'Getting Your Location...' : 'Get Directions'}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowMapModal(false);
                    setTrackingLawyer(null);
                  }}
                  className="w-full px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-100 transition font-bold text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 rounded-b-lg">
              <p className="text-xs text-gray-600 font-[family-name:var(--font-inter)]">
                <strong>"Get Directions"</strong> requires your location permission to show driving directions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="px-4 sm:px-6 py-12 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-khand)] mb-4">
            Need a Different Search?
          </h2>
          <p className="text-red-100 font-[family-name:var(--font-inter)] mb-6">
            Try searching with different practice areas or locations to find the right lawyer for your case.
          </p>
          <Link href="/">
            <button className="px-8 py-3 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition">
              Start New Search
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading results...</div>}>
      <ResultsPageContent />
    </Suspense>
  );
}
