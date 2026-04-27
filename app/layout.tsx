import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./components/LanguageProvider";
import Navigation from "./components/Navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SusHi Tech Tokyo 2026 | Conference Schedule",
  description: "Official schedule for SusHi Tech Tokyo 2026 startup conference, April 27-29, 2026",
  openGraph: {
    title: "SusHi Tech Tokyo 2026",
    description: "Startup conference in Tokyo, April 27-29, 2026",
    type: "website",
    siteName: "SusHi Tech 2026 Schedule — Built by MKUltraman",
  },
  twitter: {
    creator: "@mkultraman",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <LanguageProvider>
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <footer className="text-xs text-neutral-400 py-4 text-center border-t border-neutral-100 bg-white">
            Built by Matt Ketchum •{' '}
            <a
              href="https://mkultraman.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-600 transition-colors"
            >
              MKUltraman
            </a>
            {' '}• Digital infrastructure for Japan SMEs •{' '}
            <a
              href="https://mkultraman.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-600 transition-colors"
            >
              mkultraman.com
            </a>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
