
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HamburgerMenu from './HamburgerMenu';

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
      {/* Hamburger Menu and About Creator - Top Right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex gap-2 items-center">
        <a 
          href="/creator"
          className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 font-medium px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:bg-red-50 hover:text-red-600 transition-all duration-300 group font-[family-name:var(--font-poppins)] text-sm border border-gray-100"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <span>About Creator</span>
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
        <HamburgerMenu />
      </div>
      {/* Anchor for Contact Creator */}
      <div id="contact-creator"></div>

      {/* Top Quarter - Rotating Image Section with Unique Shape and Overlapping Heading */}
      <section id="find-law-firm" className="relative w-full h-80 sm:h-96 overflow-hidden bg-gray-900 shadow-lg" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' }}>
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
      <section id="calculate-fees" className="px-4 sm:px-6 py-12 max-w-5xl mx-auto">
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
          <div id="find-law-firm-card" className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group min-h-[320px] sm:min-h-[340px] lg:min-h-[360px]"
            onClick={handleFindLawyer}>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-400/15 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div id="verify-lawyer" className="relative z-10 p-4 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8">
              <div className="flex-1 w-full p-1 sm:p-3">
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
              
              {/* Search Illustration - always visible, responsive */}
              <div className="flex items-center justify-center w-full h-56 sm:h-72 lg:w-1/2 lg:h-80 mt-6 lg:mt-0">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-75"></div>
                <img 
                  src="/search.svg" 
                  alt="Search for lawyers illustration" 
                  className="max-w-full h-auto object-contain relative z-10 drop-shadow-2xl opacity-95"
                  style={{
                    filter: 'drop-shadow(0 25px 25px rgba(0,0,0,0.15))'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Verify Lawyer - NBA Style Hero Card */}
          <div id="verify-lawyer-card" className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group min-h-[320px] sm:min-h-[340px] lg:min-h-[360px]"
            onClick={handleVerifyLawyer}>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-400/15 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 p-4 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8">
              <div className="flex-1 w-full p-1 sm:p-3">
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
              
              {/* 2D Illustration - always visible, responsive */}
              <div className="flex items-center justify-center w-full h-56 sm:h-72 lg:w-1/2 lg:h-80 mt-6 lg:mt-0">
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
          <div id="calculate-fees-card" className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group min-h-[320px] sm:min-h-[340px] lg:min-h-[360px]"
            onClick={handleCheckFees}>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-400/15 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 p-4 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8">
              <div className="flex-1 w-full p-1 sm:p-3">
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
              
              {/* Wallet Illustration - always visible, responsive */}
              <div className="flex items-center justify-center w-full h-56 sm:h-72 lg:w-1/2 lg:h-80 mt-6 lg:mt-0">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-75"></div>
                <img 
                  src="/wallet.svg" 
                  alt="Legal fees illustration" 
                  className="max-w-full h-auto object-contain relative z-10 drop-shadow-2xl opacity-95"
                  style={{
                    filter: 'drop-shadow(0 25px 25px rgba(0,0,0,0.15))'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          MISSION, CHALLENGES & HELP SECTION
          Scroll-reveal animations, hover interactions
          ============================================ */}
      <section className="relative bg-gradient-to-b from-white via-gray-50/50 to-white py-24 overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-40"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-red-100/30 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          
          {/* ==================== OUR MISSION ==================== */}
          <div id="our-mission" className="mb-28 group">
            <div className="relative">
              {/* Decorative line - reveals on scroll */}
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-red-500 via-red-400 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <span className="inline-block text-xs font-bold tracking-[0.3em] text-red-500 uppercase mb-4 font-[family-name:var(--font-poppins)]">
                01 — Our Mission
              </span>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-10 leading-[1.1] italic">
                Demystifying law.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 mt-2">
                  One search at a time.
                </span>
              </h2>
              
              <div className="space-y-6 max-w-3xl">
                <p className="text-lg sm:text-xl text-gray-700 font-[family-name:var(--font-poppins)] leading-relaxed hover:text-gray-900 transition-colors duration-300">
                  Think about the convenience of the Uber app, the Glovo app, AirBNB, airplane booking sites or even Google Maps generally. They make things convenient right?
                </p>
                <p className="text-lg text-gray-600 font-[family-name:var(--font-poppins)] leading-relaxed hover:text-gray-800 transition-colors duration-300">
                  Well, let's try to offer something of that nature to Nigerians in relation to law. Now, we can't help you book lawyers online but we can sure help you find them or know what they may charge!
                  <span className="inline-block ml-2 text-red-500 font-semibold hover:scale-110 transition-transform duration-300 cursor-default">Cool right?</span>
                </p>
                <p className="text-base text-gray-600 font-[family-name:var(--font-poppins)] leading-relaxed hover:text-gray-800 transition-colors duration-300">
                  Law is a very mystified field. Rarely do learned and more educated men understand the complexities involved in finding and selecting a suitable law firm. These complexities are more apparent to the less educated members of the society
                  <span className="text-gray-500 italic"> (Those with less access to justice).</span>
                </p>
                <p className="text-base text-gray-700 font-[family-name:var(--font-poppins)] leading-relaxed font-medium">
                  We want to demystify the legal profession to acceptable extents in such a way as to ensure the dignity of the profession is maintained and the general populace of Nigeria have a better understanding of where they can find convenient legal services to suit their needs and what to expect in terms of pricing.
                </p>
              </div>
              
              {/* Three Key Services - reveals on scroll */}
              <div className="mt-14">
                <h3 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-8 italic">
                  We offer to you <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">three key services</span>
                </h3>
                
                <div className="space-y-8">
                  {/* Service 1 - Recommendation Tool */}
                  <div className="group/service relative pl-8 border-l-2 border-red-200 hover:border-red-500 transition-colors duration-500">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 opacity-0 group-hover/service:opacity-100 transition-opacity duration-300"></div>
                    <span className="inline-block text-xs font-bold tracking-wider text-red-400 uppercase mb-2 font-[family-name:var(--font-poppins)]">
                      Service One
                    </span>
                    <h4 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-poppins)] mb-3 group-hover/service:text-red-600 transition-colors duration-300">
                      Lawyer Recommendation Tool
                    </h4>
                    <p className="text-base text-gray-600 font-[family-name:var(--font-poppins)] leading-relaxed">
                      Our recommendation tool helps recommend lawyers in your exact location to you who will be able to solve your specific legal issue. There are thousands of lawyers in Nigeria and each have their area of expertise and specialisation. We try our best to match you with the closest lawyer in your location who will be able to give you what you want.
                    </p>
                    <p className="text-sm text-gray-500 font-[family-name:var(--font-poppins)] mt-3 italic opacity-0 group-hover/service:opacity-100 transition-opacity duration-500">
                      Beware though, our tool only tells you where to go and what to expect. We're not exactly assuring you of the quality of service delivered there. Maybe in some future update….
                    </p>
                  </div>
                  
                  {/* Service 2 - Verification Tool */}
                  <div className="group/service relative pl-8 border-l-2 border-red-200 hover:border-red-500 transition-colors duration-500">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 opacity-0 group-hover/service:opacity-100 transition-opacity duration-300"></div>
                    <span className="inline-block text-xs font-bold tracking-wider text-red-400 uppercase mb-2 font-[family-name:var(--font-poppins)]">
                      Service Two
                    </span>
                    <h4 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-poppins)] mb-3 group-hover/service:text-red-600 transition-colors duration-300">
                      Lawyer Practice Identification Tool
                    </h4>
                    <p className="text-base text-gray-600 font-[family-name:var(--font-poppins)] leading-relaxed">
                      Now here's what you may not know. All lawyers called to the Nigerian bar have their names on the roll of legal practitioners kept at the Supreme Court of Nigeria. A copy of the said data is periodically forwarded to the Nigerian Bar Association who then makes it available publicly on their website for members of the public to confirm the year of call and call number of anyone who claims to be a legal practitioner in Nigeria.
                    </p>
                    <p className="text-base text-gray-600 font-[family-name:var(--font-poppins)] leading-relaxed mt-3">
                      So yes, there is already a separate site where you can confirm the names of lawyers in Nigeria. So why use our tool instead?
                    </p>
                    <p className="text-sm text-gray-500 font-[family-name:var(--font-poppins)] mt-3 italic opacity-0 group-hover/service:opacity-100 transition-opacity duration-500">
                      I don't know, the fact that you've read up to this point means you may not have known in the first place. So I just made things easier for you. You're welcome :)
                    </p>
                  </div>
                  
                  {/* Service 3 - Fee Calculator */}
                  <div className="group/service relative pl-8 border-l-2 border-red-200 hover:border-red-500 transition-colors duration-500">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 opacity-0 group-hover/service:opacity-100 transition-opacity duration-300"></div>
                    <span className="inline-block text-xs font-bold tracking-wider text-red-400 uppercase mb-2 font-[family-name:var(--font-poppins)]">
                      Service Three
                    </span>
                    <h4 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-poppins)] mb-3 group-hover/service:text-red-600 transition-colors duration-300">
                      Legal Fees Calculation Tool
                    </h4>
                    <p className="text-base text-gray-600 font-[family-name:var(--font-poppins)] leading-relaxed">
                      Again, this is based on public data. But if you didn't know before, you're welcome again ;) The Legal Practitioners Remuneration Order 2023 regulates the minimum fees chargeable by lawyers <span className="text-red-500 font-medium">(Not maximum oo)</span> in respect of various transactions and depending on your state.
                    </p>
                    <p className="text-base text-gray-600 font-[family-name:var(--font-poppins)] leading-relaxed mt-3">
                      <span className="text-gray-700 font-medium">Sorry Lagosians and Abuja users, you're paying a lot more</span> <span className="italic text-gray-500">(It is the law!)</span>. Use this tool to know how much to expect in terms of fees payable to your lawyer.
                    </p>
                    <p className="text-sm text-gray-500 font-[family-name:var(--font-poppins)] mt-3 italic opacity-0 group-hover/service:opacity-100 transition-opacity duration-500">
                      Of course you should know that we're not telling you what firms will charge you as a matter of fact. Might be more, might be less. But hey, just know what to expect.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== OUR CHALLENGES ==================== */}
          <div id="our-challenges" className="mb-28 group">
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-gray-400 via-gray-300 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <span className="inline-block text-xs font-bold tracking-[0.3em] text-gray-400 uppercase mb-4 font-[family-name:var(--font-poppins)]">
                02 — Our Challenges
              </span>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-6 leading-[1.1] italic">
                We're not perfect.
                <span className="block text-gray-400 mt-2 text-3xl sm:text-4xl lg:text-5xl">
                  Yet.
                </span>
              </h2>
              
              <p className="text-lg text-gray-600 font-[family-name:var(--font-poppins)] leading-relaxed mb-10 max-w-2xl">
                There are various limitations with this project
              </p>
              
              <div className="space-y-8 max-w-3xl">
                {/* Challenge 1 */}
                <div className="group/item pl-8 border-l-2 border-gray-200 hover:border-red-400 transition-colors duration-300">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm font-[family-name:var(--font-poppins)] group-hover/item:bg-red-100 group-hover/item:text-red-600 transition-colors duration-300">1</span>
                    <div>
                      <p className="text-lg text-gray-700 font-[family-name:var(--font-poppins)] font-medium group-hover/item:text-gray-900 transition-colors leading-relaxed">
                        Not all lawyers in Nigeria have law firms.
                      </p>
                      <p className="text-base text-gray-500 mt-2 font-[family-name:var(--font-poppins)] leading-relaxed">
                        So for now we offer law firm recommendation and not lawyer recommendation.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Challenge 2 */}
                <div className="group/item pl-8 border-l-2 border-gray-200 hover:border-red-400 transition-colors duration-300">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm font-[family-name:var(--font-poppins)] group-hover/item:bg-red-100 group-hover/item:text-red-600 transition-colors duration-300">2</span>
                    <div>
                      <p className="text-lg text-gray-700 font-[family-name:var(--font-poppins)] font-medium group-hover/item:text-gray-900 transition-colors leading-relaxed">
                        Not all law firms in Nigeria have a digital presence.
                      </p>
                      <p className="text-base text-gray-500 mt-2 font-[family-name:var(--font-poppins)] leading-relaxed">
                        Some aren't even captured on Google Maps or have websites so we might not be able to recommend all firms in your location.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Challenge 3 */}
                <div className="group/item pl-8 border-l-2 border-gray-200 hover:border-red-400 transition-colors duration-300">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm font-[family-name:var(--font-poppins)] group-hover/item:bg-red-100 group-hover/item:text-red-600 transition-colors duration-300">3</span>
                    <div>
                      <p className="text-lg text-gray-700 font-[family-name:var(--font-poppins)] font-medium group-hover/item:text-gray-900 transition-colors leading-relaxed">
                        We cannot tell you the quality of service to expect in these law firms.
                      </p>
                      <p className="text-base text-gray-500 mt-2 font-[family-name:var(--font-poppins)] leading-relaxed">
                        We can only tell you where to go and what they do.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== HOW YOU CAN HELP ==================== */}
          <div id="how-you-can-help" className="group">
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-green-500 via-green-400 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <span className="inline-block text-xs font-bold tracking-[0.3em] text-green-600 uppercase mb-4 font-[family-name:var(--font-poppins)]">
                03 — How You Can Help Us
              </span>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-8 leading-[1.1] italic">
                Only the lawyers
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-500 mt-2">
                  can help us!
                </span>
              </h2>
              
              <div className="space-y-6 max-w-3xl">
                <p className="text-lg sm:text-xl text-gray-700 font-[family-name:var(--font-poppins)] leading-relaxed">
                  We need more lawyers to put details of their firms online.
                </p>
                <p className="text-base text-gray-600 font-[family-name:var(--font-poppins)] leading-relaxed">
                  They can do this by publishing their firm websites or opening social media and networking pages/accounts for their firms.
                </p>
                <p className="text-xl text-gray-900 font-[family-name:var(--font-poppins)] font-bold mt-8 hover:text-green-600 transition-colors duration-300 cursor-default">
                  The more details of law firms available online, the more firms we can suggest to you.
                </p>
              </div>
              
              {/* CTA for lawyers - expands on hover */}
              <div className="mt-12 flex flex-wrap gap-4">
                <a 
                  href="https://www.google.com/business/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold px-8 py-4 rounded-2xl hover:from-green-500 hover:to-green-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group/btn font-[family-name:var(--font-poppins)]"
                >
                  Register Your Firm on Google
                  <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/company/setup/new/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-white border-2 border-green-500 text-green-600 font-bold px-8 py-4 rounded-2xl hover:bg-green-50 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 group/btn font-[family-name:var(--font-poppins)]"
                >
                  Create LinkedIn Page
                  <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-12 max-w-5xl mx-auto">
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
