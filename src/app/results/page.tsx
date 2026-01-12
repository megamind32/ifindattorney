'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// ============================================================================
// INTERFACES
// ============================================================================

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
  logoUrl?: string;
  description?: string;
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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getLogoUrl(website?: string): string {
  if (!website) return '';
  try {
    const url = new URL(website.startsWith('http') ? website : `https://${website}`);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
  } catch {
    return '';
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(word => word.length > 0 && !['&', 'and', 'the', 'of'].includes(word.toLowerCase()))
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

function getAccentColor(name: string): string {
  const colors = [
    'from-red-500 to-rose-600',
    'from-red-600 to-red-700',
    'from-rose-500 to-red-600',
    'from-red-400 to-rose-500',
    'from-rose-600 to-red-500',
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

// ============================================================================
// FIRM CARD COMPONENT
// ============================================================================

interface FirmCardProps {
  lawyer: Lawyer;
  index: number;
  isMatch: boolean;
  userPracticeAreas?: string[];
}

function FirmCard({ lawyer, index, isMatch, userPracticeAreas }: FirmCardProps) {
  const [imageError, setImageError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const logoUrl = getLogoUrl(lawyer.website);
  const initials = getInitials(lawyer.firmName);
  const accentColor = getAccentColor(lawyer.firmName);

  const matchingAreas = lawyer.practiceAreas?.filter(area => 
    userPracticeAreas?.some(userArea => 
      area.toLowerCase().includes(userArea.toLowerCase()) ||
      userArea.toLowerCase().includes(area.toLowerCase())
    )
  ) || [];

  const isGeneralPractice = lawyer.practiceAreas?.some(area => 
    area.toLowerCase().includes('general')
  );

  return (
    <div 
      className={`
        group relative bg-white rounded-3xl overflow-hidden
        shadow-lg hover:shadow-2xl transition-all duration-500 ease-out
        transform hover:-translate-y-2 hover:scale-[1.02]
        border-2 ${isMatch ? 'border-red-200' : 'border-gray-100'}
        ${expanded ? 'ring-4 ring-red-100' : ''}
      `}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {isMatch && (
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
            ✓ Best Match
          </div>
        </div>
      )}

      <div className={`relative h-48 bg-gradient-to-br ${accentColor} overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {logoUrl && !imageError ? (
              <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center p-3 transform group-hover:scale-110 transition-transform duration-300">
                <Image
                  src={logoUrl}
                  alt={`${lawyer.firmName} logo`}
                  width={64}
                  height={64}
                  className="object-contain"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold bg-gradient-to-br from-red-600 to-rose-500 bg-clip-text text-transparent">
                  {initials}
                </span>
              </div>
            )}
          </div>
        </div>

        {lawyer.rating && (
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5">
            <span className="text-yellow-500">★</span>
            <span className="font-bold text-gray-800">{lawyer.rating.toFixed(1)}</span>
            {lawyer.reviewCount && (
              <span className="text-gray-500 text-sm">({lawyer.reviewCount})</span>
            )}
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
            {lawyer.firmName}
          </h3>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {lawyer.location}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Practice Areas</p>
          <div className="flex flex-wrap gap-2">
            {lawyer.practiceAreas?.slice(0, 4).map((area, idx) => (
              <span
                key={idx}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-all
                  ${matchingAreas.includes(area) 
                    ? 'bg-red-100 text-red-700 ring-2 ring-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {area}
              </span>
            ))}
            {(lawyer.practiceAreas?.length || 0) > 4 && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                +{(lawyer.practiceAreas?.length || 0) - 4} more
              </span>
            )}
          </div>
        </div>

        {(lawyer.description || lawyer.matchReason) && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {lawyer.description || lawyer.matchReason}
          </p>
        )}

        <div className={`space-y-3 overflow-hidden transition-all duration-300 ${expanded ? 'max-h-96' : 'max-h-0'}`}>
          <div className="pt-4 border-t border-gray-100 space-y-3">
            {lawyer.address && (
              <div className="flex items-start gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Address</p>
                  <p className="text-gray-500">{lawyer.address}</p>
                </div>
              </div>
            )}
            
            {lawyer.phone && (
              <div className="flex items-start gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Phone</p>
                  <a href={`tel:${lawyer.phone}`} className="text-red-600 hover:text-red-700 font-medium">
                    {lawyer.phone}
                  </a>
                </div>
              </div>
            )}

            {lawyer.email && (
              <div className="flex items-start gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Email</p>
                  <a href={`mailto:${lawyer.email}`} className="text-red-600 hover:text-red-700 font-medium break-all">
                    {lawyer.email}
                  </a>
                </div>
              </div>
            )}

            {lawyer.website && (
              <div className="flex items-start gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Website</p>
                  <a 
                    href={lawyer.website.startsWith('http') ? lawyer.website : `https://${lawyer.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700 font-medium break-all"
                  >
                    Visit Website →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-center text-sm text-gray-500 hover:text-red-600 transition-colors py-2 flex items-center justify-center gap-1"
        >
          {expanded ? (
            <>
              <span>Show Less</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              <span>View Contact Details</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      </div>

      <div className="px-6 pb-6 pt-2 flex gap-3">
        {lawyer.phone && (
          <a
            href={`tel:${lawyer.phone}`}
            className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-center py-3 px-4 rounded-xl font-semibold hover:from-red-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            📞 Call Now
          </a>
        )}
        {lawyer.gmapsUrl && (
          <a
            href={lawyer.gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white border-2 border-red-200 text-red-600 text-center py-3 px-4 rounded-xl font-semibold hover:bg-red-50 hover:border-red-300 transition-all"
          >
            📍 Directions
          </a>
        )}
      </div>

      {isGeneralPractice && !isMatch && (
        <div className="mx-6 mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-700 flex items-center gap-2">
            <span className="text-amber-500">💡</span>
            General practice firm - handles various legal matters
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12 space-y-4">
          <div className="h-10 w-64 bg-gray-200 rounded-full mx-auto animate-pulse" />
          <div className="h-6 w-96 bg-gray-100 rounded-full mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg">
              <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
              <div className="p-6 space-y-4">
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
                  <div className="h-6 w-24 bg-gray-100 rounded-full animate-pulse" />
                </div>
                <div className="flex gap-3 pt-4">
                  <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
                  <div className="flex-1 h-12 bg-gray-100 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN RESULTS PAGE CONTENT
// ============================================================================

function ResultsPageContent() {
  const router = useRouter();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        setError('');

        if (typeof window === 'undefined') return;

        const formDataStr = sessionStorage.getItem('userFormData');
        
        if (!formDataStr) {
          setError('Form data not found. Please fill the form again.');
          setLoading(false);
          return;
        }

        let formData;
        try {
          formData = JSON.parse(formDataStr);
        } catch {
          setError('Invalid form data. Please fill the form again.');
          setLoading(false);
          return;
        }

        if (formData.agentResults?.results?.length > 0) {
          const agentResponse = formData.agentResults;
          
          const transformedResults: ResultsData = {
            success: agentResponse.success,
            state: agentResponse.state,
            lga: agentResponse.lga,
            practiceArea: formData.practiceAreas?.[0] || 'General Legal Services',
            selectedPracticeAreas: formData.practiceAreas || [],
            budget: formData.budget,
            legalIssue: formData.legalIssue,
            totalRecommendations: agentResponse.firmsFound,
            results: agentResponse.results || [],
            source: agentResponse.source || 'AI Agent - Google Maps',
            message: agentResponse.message,
            matchingStrategy: `AI Agent Search Results - ${agentResponse.firmsFound} firms found`,
            guaranteedResults: true,
            resultsFound: agentResponse.firmsFound,
          };

          setResults(transformedResults);
          setLoading(false);
          return;
        }

        const response = await fetch('/api/search-lawyers-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            state: formData.state,
            lga: formData.lga,
            practiceAreas: formData.practiceAreas || ['General Legal Services'],
            budget: formData.budget,
            legalIssue: formData.legalIssue,
          }),
        });

        if (!response.ok) throw new Error('Failed to fetch lawyers');

        const data = await response.json();
        
        const transformedResults: ResultsData = {
          success: data.success,
          state: data.state,
          lga: data.lga,
          practiceArea: formData.practiceAreas?.[0] || 'General Legal Services',
          selectedPracticeAreas: formData.practiceAreas || [],
          budget: formData.budget,
          legalIssue: formData.legalIssue,
          totalRecommendations: data.firmsFound,
          results: data.results || [],
          source: data.source || 'AI Agent',
          message: data.message,
          matchingStrategy: `Found ${data.firmsFound} firms`,
          guaranteedResults: true,
          resultsFound: data.firmsFound,
        };

        setResults(transformedResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  const sortedLawyers = (): Lawyer[] => {
    if (!results?.results) return [];
    
    const lawyers = [...results.results];
    const userAreas = results.selectedPracticeAreas || [];

    return lawyers.sort((a, b) => {
      const aMatches = a.practiceAreas?.some(area => 
        userAreas.some(userArea => 
          area.toLowerCase().includes(userArea.toLowerCase()) ||
          userArea.toLowerCase().includes(area.toLowerCase())
        )
      ) || false;

      const bMatches = b.practiceAreas?.some(area => 
        userAreas.some(userArea => 
          area.toLowerCase().includes(userArea.toLowerCase()) ||
          userArea.toLowerCase().includes(area.toLowerCase())
        )
      ) || false;

      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;

      return (b.matchScore || 0) - (a.matchScore || 0);
    });
  };

  const matchingFirms = sortedLawyers().filter(lawyer => 
    lawyer.practiceAreas?.some(area => 
      results?.selectedPracticeAreas?.some(userArea => 
        area.toLowerCase().includes(userArea.toLowerCase()) ||
        userArea.toLowerCase().includes(area.toLowerCase())
      )
    )
  );

  const otherFirms = sortedLawyers().filter(lawyer => 
    !lawyer.practiceAreas?.some(area => 
      results?.selectedPracticeAreas?.some(userArea => 
        area.toLowerCase().includes(userArea.toLowerCase()) ||
        userArea.toLowerCase().includes(area.toLowerCase())
      )
    )
  );

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            href="/form"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-red-600 hover:to-rose-600 transition-all shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Form
          </Link>
        </div>
      </div>
    );
  }

  const allLawyers = sortedLawyers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
      <section className="relative overflow-hidden px-4 sm:px-6 pt-12 pb-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-rose-100 rounded-full opacity-50 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <Link
            href="/form"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors mb-8 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">New Search</span>
          </Link>

          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <span className="bg-red-100 text-red-700 text-sm font-semibold px-4 py-2 rounded-full">
                {allLawyers.length} Law Firm{allLawyers.length !== 1 ? 's' : ''} Found
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Your Legal <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500">Matches</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {results?.selectedPracticeAreas?.length ? (
                <>
                  Law firms specializing in <span className="font-semibold text-red-600">{results.selectedPracticeAreas.join(', ')}</span>
                  {results.lga && results.state && (
                    <> in <span className="font-semibold">{results.lga}, {results.state}</span></>
                  )}
                </>
              ) : (
                <>Law firms in {results?.state || 'your area'}</>
              )}
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location</p>
                <p className="font-semibold text-gray-900">{results?.lga || 'All'}, {results?.state}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Practice Area</p>
                <p className="font-semibold text-gray-900">{results?.selectedPracticeAreas?.[0] || 'General'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Budget</p>
                <p className="font-semibold text-gray-900">{results?.budget || 'Any'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Results</p>
                <p className="font-semibold text-red-600">{allLawyers.length} Firms</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {allLawyers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Law Firms Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We couldn't find law firms matching your criteria. Try adjusting your search or explore other locations.
              </p>
              <Link
                href="/form"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-red-600 hover:to-rose-600 transition-all shadow-lg"
              >
                Try Another Search
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {matchingFirms.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Best Matches</h2>
                      <p className="text-sm text-gray-500">Firms specializing in your selected practice area</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {matchingFirms.map((lawyer, idx) => (
                      <FirmCard
                        key={idx}
                        lawyer={lawyer}
                        index={idx}
                        isMatch={true}
                        userPracticeAreas={results?.selectedPracticeAreas}
                      />
                    ))}
                  </div>
                </div>
              )}

              {otherFirms.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {matchingFirms.length === 0 ? 'Available Firms' : 'Other Firms in Your Area'}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {matchingFirms.length === 0 
                          ? `General practice and other law firms in ${results?.state}` 
                          : 'Additional options you may consider'}
                      </p>
                    </div>
                  </div>

                  {matchingFirms.length === 0 && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-amber-800 flex items-start gap-3">
                        <span className="text-xl">💡</span>
                        <span>
                          <strong>No exact matches found</strong> for {results?.selectedPracticeAreas?.join(', ')} in {results?.lga}, {results?.state}. 
                          Below are general practice firms that may be able to assist with your legal needs.
                        </span>
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {otherFirms.map((lawyer, idx) => (
                      <FirmCard
                        key={idx}
                        lawyer={lawyer}
                        index={idx}
                        isMatch={false}
                        userPracticeAreas={results?.selectedPracticeAreas}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="px-4 sm:px-6 py-12 bg-gradient-to-r from-red-500 to-rose-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">
            Need Help Choosing?
          </h3>
          <p className="text-red-100 mb-8 max-w-xl mx-auto">
            Not sure which firm is right for your case? Our AI assistant can help you make the best choice.
          </p>
          <Link
            href="/form"
            className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-red-50 transition-all shadow-lg"
          >
            Start a New Search
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// PAGE EXPORT
// ============================================================================

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ResultsPageContent />
    </Suspense>
  );
}
