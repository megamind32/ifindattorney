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

        {/* Feature Cards - Unique Asymmetric Design */}
        <div className="space-y-6 content-transition">
          {/* Card 1: Find a Lawyer - Sharp Left */}
          <div className="card-sharp-left bg-white border-2 border-red-200 p-6 sm:p-8 shadow-lg hover:shadow-xl transition group cursor-pointer" 
               onClick={handleFindLawyer}
               style={{ borderRadius: '0 28px 28px 0' }}>
            <div className="flex items-start gap-5 pl-2">
              <div className="icon-container-unique flex-shrink-0 mt-1">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 mb-3" style={{ letterSpacing: '0.01em' }}>
                  Find Your Lawyer
                </h3>
                <p className="text-sm sm:text-base text-gray-700 font-[family-name:var(--font-inter)] leading-relaxed mb-5">
                  Let's find you the perfect lawyer to suit your needs anywhere in Nigeria. Just tell us your legal issue and your location. We'll give you a list of available firms to suit your needs ASAP.
                </p>
                <button
                  onClick={handleFindLawyer}
                  className="inline-flex items-center gap-2 text-red-600 font-bold text-sm hover:translate-x-1 transition"
                >
                  Get Started <span className="text-lg">→</span>
                </button>
              </div>
              <div className="hidden sm:block text-6xl text-red-100 group-hover:text-red-200 transition">🔍</div>
            </div>
          </div>

          {/* Card 2: Verify Lawyer - Sharp Right */}
          <div className="card-sharp-right bg-gradient-to-br from-white to-red-50 border-2 border-red-200 p-6 shadow-lg hover:shadow-xl transition group cursor-pointer"
               onClick={handleVerifyLawyer}
               style={{ borderRadius: '28px 0 0 28px' }}>
            <div className="flex items-start gap-5 pr-2">
              <div className="hidden sm:block text-6xl text-red-100 group-hover:text-red-200 transition">✓</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-1">
                  Verify Credentials
                </h3>
                <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)] mb-4">
                  Check if your lawyer is registered with the Nigerian Bar Association database.
                </p>
                <button
                  onClick={handleVerifyLawyer}
                  className="inline-flex items-center gap-2 text-red-600 font-bold text-sm hover:translate-x-1 transition"
                >
                  Verify <span className="text-lg">→</span>
                </button>
              </div>
              <div className="icon-container-unique flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3: Know Expected Fees - Sharp Left */}
          <div className="card-sharp-left bg-white border-2 border-red-200 p-6 shadow-lg hover:shadow-xl transition group cursor-pointer"
               onClick={handleCheckFees}
               style={{ borderRadius: '0 28px 28px 0' }}>
            <div className="flex items-start gap-5 pl-2">
              <div className="icon-container-unique flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold font-[family-name:var(--font-khand)] text-gray-900 mb-1">
                  Know Fair Fees
                </h3>
                <p className="text-sm text-gray-600 font-[family-name:var(--font-inter)] mb-4">
                  Transparent minimum rates across states & service types. No surprises.
                </p>
                <button
                  onClick={handleCheckFees}
                  className="inline-flex items-center gap-2 text-red-600 font-bold text-sm hover:translate-x-1 transition"
                >
                  Explore Rates <span className="text-lg">→</span>
                </button>
              </div>
              <div className="hidden sm:block text-6xl text-red-100 group-hover:text-red-200 transition">💰</div>
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
