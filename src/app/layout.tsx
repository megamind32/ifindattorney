import type { Metadata } from "next";
import { Inter, Khand } from "next/font/google";
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
        className={`${inter.variable} ${khand.variable} antialiased bg-white text-black font-[family-name:var(--font-inter)]`}
      >
        <nav className="border-b border-black/10 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold font-[family-name:var(--font-khand)]">
              iFind Attorney
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
        {children}
        <footer className="border-t border-black/10 px-6 py-8 mt-20">
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

