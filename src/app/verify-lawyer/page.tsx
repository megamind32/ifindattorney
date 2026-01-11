'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LawyerDetails {
  name: string;
  enrollmentNumber?: string;
  yearOfCall?: string;
  branch?: string;
  state?: string;
  status?: string;
  type?: string;
  source?: string;
}

interface SearchResult {
  found: boolean;
  lawyerName: string;
  message: string;
  lawyers: LawyerDetails[];
  totalCount: number;
  nbaLink: string;
}

export default function VerifyLawyerPage() {
  const [lawyerName, setLawyerName] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch('/api/verify-lawyer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lawyerName }),
      });

      const data = await response.json();
      
      setSearchResults({
        found: data.found,
        lawyerName: data.lawyerName,
        message: data.message,
        lawyers: data.lawyers || [],
        totalCount: data.totalCount || 0,
        nbaLink: data.nbaLink,
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({
        found: false,
        lawyerName: lawyerName,
        message: 'An error occurred while searching. Please try again.',
        lawyers: [],
        totalCount: 0,
        nbaLink: 'https://www.nigerianbar.org.ng/find-a-lawyer',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Card - NBA Style */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Text Content */}
            <div className="flex-1 px-6 sm:px-10 lg:px-16 py-12 lg:py-16 z-10">
              <div className="max-w-xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-white text-sm font-medium">NBA Verified Database</span>
                </div>
                
                {/* Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-[family-name:var(--font-playfair)] leading-tight mb-4">
                  Verify Lawyer<br />
                  <span className="text-red-200">Credentials</span>
                </h1>
                
                {/* Description */}
                <p className="text-lg text-red-100 font-[family-name:var(--font-poppins)] mb-8 leading-relaxed">
                  Instantly verify any Nigerian lawyer's registration status with the Nigerian Bar Association. Protect yourself from fraudulent practitioners.
                </p>
                
                {/* Search Form */}
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={lawyerName}
                      onChange={(e) => setLawyerName(e.target.value)}
                      placeholder="Enter lawyer's name or enrollment number"
                      required
                      disabled={loading}
                      className="w-full px-5 py-4 pr-14 bg-white rounded-2xl font-[family-name:var(--font-poppins)] text-gray-900 placeholder-gray-500 text-base shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition disabled:opacity-70"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition disabled:opacity-50"
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </form>
                
                {/* Trust Indicators */}
                <div className="flex items-center gap-6 mt-8">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-red-100 text-sm">Live Database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-100 text-sm">Official NBA Source</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Lawyer Image */}
            <div className="relative flex-1 flex justify-end items-end lg:min-h-[500px]">
              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 w-72 h-72 bg-red-500/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-40 w-48 h-48 bg-red-400/20 rounded-full blur-2xl"></div>
              
              {/* Lawyer Image - Background removed version */}
              <div className="relative z-10 w-full max-w-md lg:max-w-lg xl:max-w-xl overflow-hidden">
                <Image
                  src="/sarumi-lawyer.png"
                  alt="Professional Nigerian Lawyer"
                  width={600}
                  height={700}
                  className="object-contain object-bottom drop-shadow-2xl"
                  priority
                  style={{
                    maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 95%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 95%)',
                    maxHeight: '420px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Results Section */}
      <section className="px-4 sm:px-6 lg:px-16 py-12 max-w-4xl mx-auto">
        {/* Results */}
        {searched && searchResults && (
          <div className={`bg-white rounded-3xl p-8 shadow-xl border-2 mb-8 ${
            searchResults.found ? 'border-green-200' : 'border-red-200'
          }`}>
            <div className="flex items-start gap-5 mb-6">
              <div className={`flex-shrink-0 h-16 w-16 rounded-2xl flex items-center justify-center ${
                searchResults.found ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <svg className={`h-8 w-8 ${searchResults.found ? 'text-green-600' : 'text-red-600'}`} 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {searchResults.found ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
              </div>
              <div className="flex-1">
                <h3 className={`text-2xl font-bold font-[family-name:var(--font-playfair)] mb-2 ${
                  searchResults.found ? 'text-green-700' : 'text-red-700'
                }`}>
                  {searchResults.found ? `${searchResults.totalCount} Result${searchResults.totalCount > 1 ? 's' : ''} Found` : 'Not Found'}
                </h3>
                <p className="text-gray-600 font-[family-name:var(--font-poppins)]">
                  {searchResults.message}
                </p>
              </div>
            </div>
            
            {/* Display ALL lawyers */}
            {searchResults.found && searchResults.lawyers.length > 0 && (
              <div className="space-y-4">
                {searchResults.lawyers.map((lawyer, index) => (
                  <div key={lawyer.enrollmentNumber || index} className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-base font-bold text-green-900 font-[family-name:var(--font-playfair)]">
                        {searchResults.lawyers.length > 1 ? `Lawyer #${index + 1}` : 'Verified Lawyer'}
                      </h4>
                      {lawyer.type && (
                        <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                          lawyer.type.includes('SAN') 
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                            : 'bg-green-100 text-green-800 border border-green-300'
                        }`}>
                          {lawyer.type.includes('SAN') ? '⭐ Senior Advocate' : '✓ Legal Practitioner'}
                        </span>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm text-green-800 font-[family-name:var(--font-poppins)]">
                      {lawyer.name && (
                        <p><span className="font-semibold text-green-900">Name:</span> {lawyer.name}</p>
                      )}
                      {lawyer.enrollmentNumber && (
                        <p><span className="font-semibold text-green-900">SCN:</span> {lawyer.enrollmentNumber}</p>
                      )}
                      {lawyer.yearOfCall && (
                        <p><span className="font-semibold text-green-900">Year of Call:</span> {lawyer.yearOfCall}</p>
                      )}
                      {lawyer.branch && (
                        <p><span className="font-semibold text-green-900">Branch:</span> {lawyer.branch}</p>
                      )}
                      {lawyer.state && (
                        <p><span className="font-semibold text-green-900">State:</span> {lawyer.state}</p>
                      )}
                      {lawyer.status && (
                        <p><span className="font-semibold text-green-900">Status:</span> {lawyer.status}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Source info */}
                <div className="pt-4 border-t border-green-200 flex items-center justify-between">
                  <p className="text-sm text-green-600 font-[family-name:var(--font-poppins)]">
                    <span className="font-semibold">Source:</span> Nigerian Bar Association
                  </p>
                  <a
                    href={searchResults.nbaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                  >
                    View on NBA
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            )}
            
            {!searchResults.found && (
              <div className="mt-4">
                <a
                  href={searchResults.nbaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold"
                >
                  Search directly on NBA Website
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Why Verify Section */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-6">
            Why Verify Your Lawyer?
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Confirm Qualification</h3>
                <p className="text-sm text-gray-600">Ensure your lawyer is qualified to practice law in Nigeria</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Fraud Protection</h3>
                <p className="text-sm text-gray-600">Protect yourself from fraudulent practitioners</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">NBA Standing</h3>
                <p className="text-sm text-gray-600">Verify professional standing with the Bar Association</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Build Confidence</h3>
                <p className="text-sm text-gray-600">Have peace of mind in your legal representation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-10 text-center">
          <Link href="/">
            <button className="px-8 py-4 bg-red-600 text-white font-semibold rounded-2xl hover:bg-red-700 transition shadow-lg hover:shadow-xl">
              ← Back to Home
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
