"use client";

export default function HamburgerMenu() {
  return (
    <div className="relative">
      <button
        id="hamburger-menu-btn"
        className="ml-2 flex flex-col justify-center items-center w-10 h-10 rounded-full border border-gray-200 bg-white shadow hover:bg-red-50 transition group focus:outline-none"
        onClick={() => {
          const menu = document.getElementById('main-hamburger-dropdown');
          if (menu) menu.classList.toggle('hidden');
        }}
        aria-label="Open menu"
        type="button"
      >
        <span className="block w-6 h-0.5 bg-red-600 mb-1 rounded transition-all duration-300"></span>
        <span className="block w-6 h-0.5 bg-red-600 mb-1 rounded transition-all duration-300"></span>
        <span className="block w-6 h-0.5 bg-red-600 rounded transition-all duration-300"></span>
      </button>
      <div
        id="main-hamburger-dropdown"
        className="hidden absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 animate-fadeIn"
        style={{ minWidth: '220px' }}
      >
        <a href="#find-law-firm-card" className="block px-5 py-3 text-gray-800 hover:bg-red-50 hover:text-red-600 font-medium transition-all">Find law firm in your location</a>
        <a href="#verify-lawyer-card" className="block px-5 py-3 text-gray-800 hover:bg-red-50 hover:text-red-600 font-medium transition-all">Verify lawyer</a>
        <a href="#calculate-fees-card" className="block px-5 py-3 text-gray-800 hover:bg-red-50 hover:text-red-600 font-medium transition-all">Calculate likely fees</a>
        <a href="#our-mission" className="block px-5 py-3 text-gray-800 hover:bg-red-50 hover:text-red-600 font-medium transition-all">Our mission</a>
        <a href="#our-challenges" className="block px-5 py-3 text-gray-800 hover:bg-red-50 hover:text-red-600 font-medium transition-all">Our challenges</a>
        <a href="#how-you-can-help" className="block px-5 py-3 text-gray-800 hover:bg-red-50 hover:text-red-600 font-medium transition-all">How you can help us</a>
        <a href="#contact-creator" className="block px-5 py-3 text-gray-800 hover:bg-red-50 hover:text-red-600 font-medium transition-all">Contact creator</a>
      </div>
    </div>
  );
}
