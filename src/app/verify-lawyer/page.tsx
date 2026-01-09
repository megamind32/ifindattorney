'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VerifyLawyerPage() {
  const [lawyerName, setLawyerName] = useState('');
  const [stateOfPractice, setStateOfPractice] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const nigerianStates = [
    'Lagos',
    'Abuja',
    'Oyo',
    'Kano',
    'Rivers',
    'Kaduna',
    'Katsina',
    'Enugu',
    'Edo',
    'Osun',
    'Bauchi',
    'Benue',
    'Jigawa',
    'Kebbi',
    'Kwara',
    'Niger',
    'Plateau',
    'Taraba',
    'Yobe',
    'Zamfara',
    'Adamawa',
    'Abia',
    'Akwa Ibom',
    'Anambra',
    'Bayelsa',
    'Cross River',
    'Delta',
    'Ebonyi',
    'Imo',
    'Ondo',
    'Ogun',
    'Sokoto',
    'Ekiti',
    'Nasarawa',
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    // Simulate API call to NBA database
    setTimeout(() => {
      // Mock results - in production this would query actual NBA database
      const isFound = lawyerName.toLowerCase() === 'chioma okonkwo' || 
                      lawyerName.toLowerCase() === 'adebayo adeleke';
      
      setSearchResults({
        found: isFound,
        lawyerName: lawyerName,
        state: stateOfPractice,
        message: isFound 
          ? `✓ ${lawyerName} is verified as a registered lawyer with the Nigerian Bar Association in ${stateOfPractice}.`
          : `✗ ${lawyerName} could not be verified in the NBA database for ${stateOfPractice}. Please verify the name and state, or contact the NBA directly.`,
        nbaLink: 'https://www.nigerianbarassociation.org'
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-white page-transition-enter">
      {/* Header */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-6 py-8 rounded-b-3xl shadow-lg content-transition">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-khand)] mb-2">
            Verify Lawyer Identity
          </h1>
          <p className="text-red-100 text-sm sm:text-base font-[family-name:var(--font-inter)]">
            Check if your lawyer is registered with the Nigerian Bar Association
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
        {/* Form Card */}
        <div className="bg-white border-2 border-red-200 rounded-2xl p-6 shadow-md mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Lawyer Name Input */}
            <div>
              <label className="block text-sm font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-2">
                Lawyer's Full Name
              </label>
              <input
                type="text"
                value={lawyerName}
                onChange={(e) => setLawyerName(e.target.value)}
                placeholder="e.g., Chioma Okonkwo"
                required
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-xl font-[family-name:var(--font-inter)] text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* State Select */}
            <div>
              <label className="block text-sm font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-2">
                State of Practice
              </label>
              <select
                value={stateOfPractice}
                onChange={(e) => setStateOfPractice(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-xl font-[family-name:var(--font-inter)] text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition disabled:bg-gray-50 disabled:cursor-not-allowed bg-white"
              >
                <option value="">Select a state...</option>
                {nigerianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Lawyer'}
            </button>
          </form>
        </div>

        {/* Results */}
        {searched && searchResults && (
          <div className={`bg-white border-2 rounded-2xl p-6 shadow-md content-transition ${
            searchResults.found ? 'border-green-200' : 'border-red-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${
                searchResults.found ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <svg className={`h-6 w-6 ${searchResults.found ? 'text-green-600' : 'text-red-600'}`} 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {searchResults.found ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold font-[family-name:var(--font-khand)] mb-2 ${
                  searchResults.found ? 'text-green-700' : 'text-red-700'
                }`}>
                  {searchResults.found ? 'Verified ✓' : 'Not Verified'}
                </h3>
                <p className="text-sm text-gray-700 font-[family-name:var(--font-inter)] mb-4">
                  {searchResults.message}
                </p>
                <a
                  href={searchResults.nbaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-red-600 hover:text-red-700 font-bold"
                >
                  Visit NBA Website →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-6 bg-red-50 rounded-2xl border border-red-200 content-transition">
          <h2 className="text-lg font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-3">
            Why Verify?
          </h2>
          <ul className="space-y-2 text-sm text-gray-700 font-[family-name:var(--font-inter)]">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-red-600 rounded-full" />
              Ensure your lawyer is qualified to practice law
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-red-600 rounded-full" />
              Protect yourself from fraudulent practitioners
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-red-600 rounded-full" />
              Verify professional standing with NBA
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-red-600 rounded-full" />
              Build confidence in your legal representation
            </li>
          </ul>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/">
            <button className="px-6 py-3 text-red-600 font-bold text-sm hover:text-red-700">
              ← Back to Home
            </button>
          </Link>
        </div>
      </section>

      <div className="h-8" />
    </main>
  );
}
