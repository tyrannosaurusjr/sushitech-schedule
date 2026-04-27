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
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="font-black text-xl text-primary">SusHi Tech 2026</span>
              <span className="ml-2 text-sm text-neutral-600">Apr 27–29 · Tokyo</span>
              <LiveBadge />
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-neutral-700 hover:text-primary font-medium transition-colors"
            >
              Schedule
            </Link>
            <Link
              href="/speakers"
              className="text-neutral-700 hover:text-primary font-medium transition-colors"
            >
              Speakers
            </Link>
            <Link
              href="/about"
              className="text-neutral-700 hover:text-primary font-medium transition-colors"
            >
              About
            </Link>
            <button
              onClick={toggleLanguage}
              className="bg-neutral-100 hover:bg-neutral-200 px-3 py-1 rounded-md text-sm font-medium transition-colors"
            >
              {language.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}