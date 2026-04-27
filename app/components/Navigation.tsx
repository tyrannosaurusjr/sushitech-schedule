'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageProvider';

function LiveBadge() {
  const now = new Date();
  const isLive = now >= new Date('2026-04-27') && now <= new Date('2026-04-29T23:59:59');

  if (!isLive) return null;

  return (
    <span className="ml-3 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded-full animate-pulse">
      NOW LIVE
    </span>
  );
}

export default function Navigation() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <nav className="border-b border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          <Link href="/" className="flex items-center min-w-0 shrink">
            <span className="font-black text-lg sm:text-xl text-primary whitespace-nowrap">SusHi Tech 2026</span>
            <span className="hidden sm:inline ml-2 text-sm text-neutral-600 whitespace-nowrap">Apr 27–29 · Tokyo</span>
            <LiveBadge />
          </Link>

          <div className="flex items-center gap-3 sm:gap-8 ml-3 shrink-0">
            <Link
              href="/"
              className="text-neutral-700 hover:text-primary font-medium transition-colors text-sm sm:text-base"
            >
              Schedule
            </Link>
            <Link
              href="/speakers"
              className="hidden sm:inline text-neutral-700 hover:text-primary font-medium transition-colors"
            >
              Speakers
            </Link>
            <Link
              href="/about"
              className="text-neutral-700 hover:text-primary font-medium transition-colors text-sm sm:text-base"
            >
              About
            </Link>
            <button
              onClick={toggleLanguage}
              className="bg-neutral-100 hover:bg-neutral-200 px-2 sm:px-3 py-1 rounded-md text-sm font-medium transition-colors"
            >
              {language.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}