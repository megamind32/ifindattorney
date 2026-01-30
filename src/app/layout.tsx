import type { Metadata, Viewport } from "next";
import Image from "next/image";
import { Inter, Khand, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const khand = Khand({
  variable: "--font-khand",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "iFind Attorney | Find Lawyers in Lagos",
  description: "AI-powered lawyer recommendation platform for Lagos State. Find the right attorney for your legal needs.",
  // Allow geolocation API to function
  other: {
    "permissions-policy": "geolocation=(self)",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${khand.variable} ${playfair.variable} ${poppins.variable} antialiased bg-white text-black font-[family-name:var(--font-inter)]`}
      >
        <nav className="border-b border-black/10 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 page-fade-in">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition flex-shrink-0">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-lg flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg transition">
                <Image
                  src="/logo-1767888513492.png"
                  alt="iFind Attorney Logo"
                  width={48}
                  height={48}
                  className="object-contain filter brightness-0 invert mix-blend-lighten"
                  priority
                />
              </div>
            </a>
            <div className="hidden sm:flex gap-8">
            </div>
          </div>
        </nav>
        <div className="page-transition-enter">
          {children}
        </div>
        <footer className="border-t border-black/10 px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 mt-16 sm:mt-20 page-fade-in">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs sm:text-sm md:text-base text-black/60">
              © 2024 iFind Attorney. <strong>Disclaimer:</strong> This platform does not provide legal advice.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

