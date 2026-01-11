'use client';

import { useState, useEffect } from 'react';

const creatorImages = [
  '/about-me/p1.JPG',
  '/about-me/p2.JPG',
  '/about-me/p3.jpg',
  '/about-me/4.JPG',
];

export default function CreatorPage() {
  const [activeImage, setActiveImage] = useState(0);

  // Auto-advance images every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => {
        // Only cycle through valid images
        const next = prev + 1;
        return next >= creatorImages.length ? 0 : next;
      });
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadCV = () => {
    const link = document.createElement('a');
    link.href = '/CV of LAWRENCE OKWARA.pdf';
    link.download = 'CV of LAWRENCE OKWARA.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/20 page-transition-enter relative">
      
      {/* Full Page Background Image - Faded & Black/White */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/about-me/p4.JPG"
          alt=""
          className="w-full h-full object-cover grayscale opacity-[0.08]"
        />
        {/* Additional fade overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/60"></div>
      </div>

      {/* Hero Section - Fluid Shape */}
      <section className="relative overflow-hidden z-10">
        {/* Abstract Background Shape */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-red-100 via-red-50 to-transparent rounded-full blur-3xl opacity-60"></div>
          <div className="absolute top-1/2 -left-20 w-[400px] h-[400px] bg-gradient-to-tr from-gray-100 to-transparent rounded-full blur-3xl opacity-40"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          
          {/* Back Button */}
          <a 
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors duration-300 mb-12 group font-[family-name:var(--font-poppins)]"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back to Home</span>
          </a>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
            {/* Left Column - Image Gallery */}
            <div className="relative">
              {/* Main Image Display with Crossfade */}
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl group">
                {/* Decorative Frame */}
                <div className="absolute -inset-1 bg-gradient-to-br from-red-500 via-red-400 to-red-600 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                
                <div className="relative h-full rounded-3xl overflow-hidden bg-gray-100">
                  {/* Stack all images for crossfade effect */}
                  {creatorImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt="Lawrence Ogechukwu Okwara"
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                        activeImage === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                      style={{zIndex: activeImage === index ? 1 : 0}}
                    />
                  ))}
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                {/* Image Counter Badge removed as requested */}
              </div>
            </div>

            {/* Right Column - Bio Content */}
            <div className="lg:sticky lg:top-8">
              {/* Name Badge */}
              <div className="inline-block mb-6">
                <span className="text-xs font-bold tracking-[0.3em] text-red-500 uppercase font-[family-name:var(--font-poppins)]">
                  About the Creator
                </span>
              </div>

              {/* Name */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-playfair)] text-gray-900 leading-[1.1] mb-6 italic">
                Lawrence
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                  Ogechukwu Okwara
                </span>
              </h1>

              {/* Tagline */}
              <p className="text-xl sm:text-2xl text-gray-600 font-[family-name:var(--font-poppins)] font-light mb-8 leading-relaxed">
                A bright and budding legal enthusiast in Nigeria.
              </p>

              {/* Divider */}
              <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-400 rounded-full mb-8"></div>

              {/* Bio Paragraphs */}
              <div className="space-y-6 text-gray-600 font-[family-name:var(--font-poppins)] leading-relaxed">
                <p className="text-base sm:text-lg">
                  He attended the <span className="text-gray-900 font-medium">University of Ilorin</span> and completed his vocational training to be a lawyer at the <span className="text-gray-900 font-medium">Nigerian Law School (Port-Harcourt Campus)</span>. He is currently awaiting his results at the Nigerian Law School.
                </p>
              </div>

              {/* Interests Section */}
              <div className="mt-10">
                <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-4 font-[family-name:var(--font-poppins)]">
                  Areas of Interest
                </h2>
                <div className="flex flex-wrap gap-3">
                  {[
                    'Courtroom Advocacy',
                    'Real Estate Development',
                    'Blockchain Regulation',
                    'Cryptocurrency Law',
                    'AI Regulation & Integration',
                  ].map((interest, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm hover:shadow-md hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-300 cursor-default font-[family-name:var(--font-poppins)]"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* CV Section */}
              <div className="mt-12 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-600 font-[family-name:var(--font-poppins)] mb-6 leading-relaxed">
                  If you care to know more about his professional life, have a look at his curriculum vitae below.
                </p>
                
                <button
                  onClick={handleDownloadCV}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold px-8 py-4 rounded-2xl hover:from-red-500 hover:to-red-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group font-[family-name:var(--font-poppins)]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Check out CV
                  <svg className="w-5 h-5 transition-transform group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              </div>

              {/* Decorative Quote */}
              <div className="mt-12 relative">
                <div className="absolute -left-4 top-0 text-6xl text-red-100 font-serif leading-none">"</div>
                <blockquote className="pl-8 text-lg text-gray-500 italic font-[family-name:var(--font-playfair)]">
                  Building tools that bridge the gap between law and accessibility.
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Accent */}
      <section className="relative py-16 z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-red-50/50 to-transparent pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-gray-400 font-[family-name:var(--font-poppins)]">
            Creator of <span className="text-red-500 font-medium">IfindAttorney</span>
          </p>
        </div>
      </section>
    </main>
  );
}
