'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const backgroundImages = [
  '/benyamin-bohlouli-LpEyM8nksws-unsplash.jpg',
  '/erik-mclean-24ZOFLNY4hA-unsplash.jpg',
  '/mateus-campos-felipe-n4CLHNL5n6Y-unsplash.jpg',
  '/prestige law firm.jpg',
  '/sanlam-allianz.jpg',
  '/supremelaw.jpg',
];

export default function Home() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
        setFadeIn(true);
      }, 500);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleFindLawyer = () => {
    router.push('/form');
  };

  const handleVerifyLawyer = () => {
    router.push('/verify-lawyer');
  };

  const handleCheckFees = () => {
    router.push('/lawyer-fees');
  };

  return (
    <main className="min-h-screen bg-white page-transition-enter">
      {/* Top Quarter - Rotating Image Section with Unique Shape and Overlapping Heading */}
      <section className="relative w-full h-80 sm:h-96 overflow-hidden bg-gray-900 shadow-lg" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' }}>
        <div className="absolute inset-0">
          <img
            src={backgroundImages[currentImageIndex]}
            alt="Background"
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              fadeIn ? 'opacity-70' : 'opacity-0'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
        </div>

        {/* Welcome Heading - Direct Overlap Without Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 content-transition">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold font-[family-name:var(--font-playfair)] text-white mb-4 leading-tight max-w-4xl text-center italic" 
              style={{ letterSpacing: '0.02em', textShadow: '0 6px 20px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.5)', fontWeight: 700 }}>
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-red-200 to-pink-300">IfindAttorney</span>
          </h1>
          <p className="text-sm sm:text-lg text-white/95 font-[family-name:var(--font-poppins)] leading-relaxed mb-4 font-medium max-w-2xl text-center" 
             style={{ textShadow: '0 4px 12px rgba(0,0,0,0.6)' }}>
            Your one stop tool for finding the most suitable firm for you
          </p>
          <p className="text-xs sm:text-base text-red-200 font-[family-name:var(--font-poppins)] italic font-light tracking-wide" 
             style={{ textShadow: '0 3px 10px rgba(0,0,0,0.5)' }}>
            Your clarity is our concern
          </p>
        </div>

        {/* Image Counter - Unique Style */}
        <div className="absolute bottom-6 right-6 bg-red-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-l-full font-bold text-xs shadow-lg transform hover:scale-110 transition">
          {currentImageIndex + 1} / {backgroundImages.length}
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 py-12 max-w-5xl mx-auto">
        {/* Feature Cards Intro - Stylish Heading */}
        <div className="mb-16 content-transition">
          <div className="relative inline-block">
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-playfair)] text-gray-900"
                style={{ letterSpacing: '0.02em' }}>
              Get started with any of our
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 mt-2">
                free to use tool
              </span>
            </h2>
            <div className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-red-600 to-transparent w-24" />
          </div>
        </div>

        {/* Feature Cards - NBA Style Design */}
        <div className="space-y-6 content-transition">
          {/* Card 1: Find a Lawyer - NBA Style Hero Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
               onClick={handleFindLawyer}>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-400/15 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-white text-xs font-semibold tracking-wide">AI-POWERED SEARCH</span>
                </div>
                
                {/* Heading */}
                <h3 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-playfair)] text-white mb-4 leading-tight">
                  Find Your<br />
                  <span className="text-red-200">Perfect Lawyer</span>
                </h3>
                
                {/* Description */}
                <p className="text-base sm:text-lg text-red-100 font-[family-name:var(--font-poppins)] mb-8 leading-relaxed max-w-md">
                  Tell us your legal issue and location. We'll match you with the best law firms across Nigeria in seconds.
                </p>
                
                {/* CTA Button */}
                <button
                  onClick={handleFindLawyer}
                  className="inline-flex items-center gap-3 bg-white text-red-700 font-bold px-6 py-3 rounded-xl hover:bg-red-50 transition-all duration-200 shadow-lg group-hover:shadow-xl group-hover:translate-x-1"
                >
                  Get Started
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                
                {/* Trust Indicators */}
                <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-red-100 text-xs font-medium">37 States Covered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-100 text-xs font-medium">Instant Results</span>
                  </div>
                </div>
              </div>
              
              {/* Search Illustration */}
              <div className="hidden lg:flex flex-shrink-0 items-center justify-center w-1/2 relative">
                {/* Glow effect behind image */}
                <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-75"></div>
                {/* Search SVG */}
                <img 
                  src="/search.svg" 
                  alt="Search for lawyers illustration" 
                  className="w-72 h-72 object-contain relative z-10 drop-shadow-2xl opacity-95"
                  style={{
                    filter: 'drop-shadow(0 25px 25px rgba(0,0,0,0.15))'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Verify Lawyer - NBA Style Hero Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
               onClick={handleVerifyLawyer}>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-400/15 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-white text-xs font-semibold tracking-wide">NBA VERIFIED</span>
                </div>
                
                {/* Heading */}
                <h3 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-playfair)] text-white mb-4 leading-tight">
                  Verify Lawyer<br />
                  <span className="text-red-200">Credentials</span>
                </h3>
                
                {/* Description */}
                <p className="text-base sm:text-lg text-red-100 font-[family-name:var(--font-poppins)] mb-8 leading-relaxed max-w-md">
                  Instantly check if any lawyer is registered with the Nigerian Bar Association. Protect yourself from fraudulent practitioners.
                </p>
                
                {/* CTA Button */}
                <button
                  onClick={handleVerifyLawyer}
                  className="inline-flex items-center gap-3 bg-white text-red-700 font-bold px-6 py-3 rounded-xl hover:bg-red-50 transition-all duration-200 shadow-lg group-hover:shadow-xl group-hover:translate-x-1"
                >
                  Verify Now
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                
                {/* Trust Indicators */}
                <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-red-100 text-xs font-medium">Live Database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-100 text-xs font-medium">Official NBA Source</span>
                  </div>
                </div>
              </div>
              
              {/* 2D Illustration - Roll of Lawyers Document with Checkmark */}
              <div className="hidden lg:flex flex-shrink-0 items-center justify-center w-1/2">
                <svg width="280" height="280" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-95">
                  {/* Background Glow */}
                  <circle cx="100" cy="110" r="80" fill="white" fillOpacity="0.05"/>
                  
                  {/* === GREEN CHECKMARK - Upper Right of Paper === */}
                  <g transform="translate(135, 15)">
                    <circle cx="20" cy="20" r="20" fill="#16a34a" fillOpacity="0.95"/>
                    <circle cx="20" cy="20" r="20" stroke="white" strokeOpacity="0.4" strokeWidth="2" fill="none"/>
                    <path d="M10 20 L17 27 L30 13" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </g>
                  
                  {/* === DOCUMENT === */}
                  {/* Paper Shadow */}
                  <rect x="38" y="48" width="120" height="150" rx="4" fill="black" fillOpacity="0.1"/>
                  
                  {/* Main Paper */}
                  <rect x="35" y="45" width="120" height="150" rx="4" fill="white" fillOpacity="0.95"/>
                  <rect x="35" y="45" width="120" height="150" rx="4" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" fill="none"/>
                  
                  {/* Paper Header Line */}
                  <line x1="45" y1="65" x2="145" y2="65" stroke="white" strokeOpacity="0.3" strokeWidth="1"/>
                  
                  {/* === ROLL OF LAWYERS - BOLD HEADING === */}
                  <text x="95" y="88" textAnchor="middle" fill="#991b1b" fontSize="14" fontWeight="900" fontFamily="Arial Black, sans-serif" letterSpacing="0.5">ROLL OF</text>
                  <text x="95" y="108" textAnchor="middle" fill="#991b1b" fontSize="16" fontWeight="900" fontFamily="Arial Black, sans-serif" letterSpacing="1">LAWYERS</text>
                  
                  {/* Underline for heading */}
                  <line x1="50" y1="116" x2="140" y2="116" stroke="#991b1b" strokeOpacity="0.6" strokeWidth="2"/>
                  
                  {/* Document Content - Name Lines */}
                  <rect x="45" y="128" width="85" height="5" rx="2" fill="white" fillOpacity="0.3"/>
                  <rect x="45" y="140" width="75" height="5" rx="2" fill="white" fillOpacity="0.25"/>
                  <rect x="45" y="152" width="80" height="5" rx="2" fill="white" fillOpacity="0.25"/>
                  <rect x="45" y="164" width="70" height="5" rx="2" fill="white" fillOpacity="0.2"/>
                  <rect x="45" y="176" width="78" height="5" rx="2" fill="white" fillOpacity="0.2"/>
                  
                  {/* Checkmarks next to names */}
                  <path d="M135 130 L138 133 L143 127" stroke="#16a34a" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M135 142 L138 145 L143 139" stroke="#16a34a" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M135 154 L138 157 L143 151" stroke="#16a34a" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  
                  {/* === FLOATING DECORATIVE ELEMENTS === */}
                  
                  {/* Shield / Verification icon */}
                  <g transform="translate(5, 60)">
                    <path d="M12 2 L22 6 L22 14 Q22 22 12 27 Q2 22 2 14 L2 6 Z" fill="white" fillOpacity="0.25" stroke="white" strokeOpacity="0.5" strokeWidth="1.5"/>
                    <path d="M7 13 L10 16 L17 9" stroke="white" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </g>
                  
                  {/* NBA Badge */}
                  <g transform="translate(5, 140)">
                    <circle cx="12" cy="12" r="12" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.4" strokeWidth="1"/>
                    <text x="12" y="16" textAnchor="middle" fill="white" fillOpacity="0.7" fontSize="8" fontWeight="bold">NBA</text>
                  </g>
                  
                  {/* Floating particles */}
                  <circle cx="175" cy="80" r="3" fill="white" fillOpacity="0.3"/>
                  <circle cx="180" cy="150" r="2.5" fill="white" fillOpacity="0.2"/>
                  <circle cx="20" cy="190" r="2.5" fill="white" fillOpacity="0.2"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3: Know Fair Fees - NBA Style Hero Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
               onClick={handleCheckFees}>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-400/15 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white text-xs font-semibold tracking-wide">OFFICIAL RATES 2023</span>
                </div>
                
                {/* Heading */}
                <h3 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-playfair)] text-white mb-4 leading-tight">
                  Know Fair<br />
                  <span className="text-red-200">Legal Fees</span>
                </h3>
                
                {/* Description */}
                <p className="text-base sm:text-lg text-red-100 font-[family-name:var(--font-poppins)] mb-8 leading-relaxed max-w-md">
                  Calculate minimum legal fees based on the Legal Practitioners Remuneration Order. No surprises, complete transparency.
                </p>
                
                {/* CTA Button */}
                <button
                  onClick={handleCheckFees}
                  className="inline-flex items-center gap-3 bg-white text-red-700 font-bold px-6 py-3 rounded-xl hover:bg-red-50 transition-all duration-200 shadow-lg group-hover:shadow-xl group-hover:translate-x-1"
                >
                  Explore Rates
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                
                {/* Trust Indicators */}
                <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-red-100 text-xs font-medium">5 Fee Scales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-100 text-xs font-medium">State-Based Pricing</span>
                  </div>
                </div>
              </div>
              
              {/* Wallet Illustration */}
              <div className="hidden lg:flex flex-shrink-0 items-center justify-center w-1/2 relative">
                {/* Glow effect behind image */}
                <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-75"></div>
                {/* Wallet SVG */}
                <img 
                  src="/wallet.svg" 
                  alt="Legal fees illustration" 
                  className="w-72 h-72 object-contain relative z-10 drop-shadow-2xl opacity-95"
                  style={{
                    filter: 'drop-shadow(0 25px 25px rgba(0,0,0,0.15))'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Why Use Section - Unique Style */}
        <div className="mt-16 pt-12 border-t-4 border-dashed border-red-200 content-transition">
          <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-1">
            Why Trust iFind<span className="text-red-600">?</span>
          </h2>
          <p className="text-gray-600 text-sm mb-6 font-[family-name:var(--font-inter)]">Everything a Nigerian needs for legal clarity</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-xs font-bold text-gray-900 font-[family-name:var(--font-khand)]">Quick Match</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🛡️</div>
              <p className="text-xs font-bold text-gray-900 font-[family-name:var(--font-khand)]">Verified</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💯</div>
              <p className="text-xs font-bold text-gray-900 font-[family-name:var(--font-khand)]">Fair Rates</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🇳🇬</div>
              <p className="text-xs font-bold text-gray-900 font-[family-name:var(--font-khand)]">Lagos First</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-5 bg-red-50 border-l-4 border-red-600 rounded-r-2xl text-xs text-gray-700 font-[family-name:var(--font-inter)] content-transition">
          <p>
            <strong className="text-red-700">⚖️ Important:</strong> This platform matches you with lawyers—we don't provide legal advice. Always discuss directly with your attorney.
          </p>
        </div>
      </section>

      <div className="h-12" />
    </main>
  );
}
