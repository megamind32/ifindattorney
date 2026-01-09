import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "iFind Attorney | Find Lawyers in Lagos",
  description: "AI-powered lawyer recommendation platform for Lagos State. Find the right attorney for your legal needs.",
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
        <nav className="border-b border-black/10 px-6 py-4 page-fade-in">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="relative w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg transition">
                <Image
                  src="/logo-1767888513492.png"
                  alt="iFind Attorney Logo"
                  width={40}
                  height={40}
                  className="object-contain filter brightness-0 invert mix-blend-lighten"
                  priority
                />
              </div>
            </a>
            <div className="flex gap-8">
              <a href="/about" className="font-[family-name:var(--font-inter)] hover:text-red-600">
                About
              </a>
              <a href="/projects" className="font-[family-name:var(--font-inter)] hover:text-red-600">
                Projects
              </a>
            </div>
          </div>
        </nav>
        <div className="page-transition-enter">
          {children}
        </div>
        <footer className="border-t border-black/10 px-6 py-8 mt-20 page-fade-in">
          <div className="max-w-6xl mx-auto">
            <p className="text-sm text-black/60">
              © 2024 iFind Attorney. <strong>Disclaimer:</strong> This platform does not provide legal advice.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

