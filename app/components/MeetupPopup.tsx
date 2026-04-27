'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';

// Swap this to a Calendly link or booking page when ready
const BOOKING_URL = 'https://calendly.com/mkultraman/mkultraman-beer';

export default function MeetupPopup() {
  const [show, setShow] = useState(false);
  const { language } = useLanguage();
  const isJP = language === 'jp';

  useEffect(() => {
    if (localStorage.getItem('meetup-dismissed')) return;
    const t = setTimeout(() => setShow(true), 10000);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('meetup-dismissed', '1');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs w-full shadow-xl rounded-xl overflow-hidden border border-neutral-200 bg-white">
      {/* Dark header bar */}
      <div className="bg-neutral-900 px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          {isJP ? 'イベント外の話' : 'Off the record'}
        </span>
        <button
          onClick={dismiss}
          className="text-neutral-500 hover:text-white transition-colors p-0.5 -mr-0.5"
          aria-label="Dismiss"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        <p className="font-black text-neutral-900 text-base leading-snug mb-2">
          {isJP
            ? '中目黒で会いましょう'
            : 'Meet me in Naka Meguro'}
        </p>
        <p className="text-sm text-neutral-600 leading-relaxed mb-4">
          {isJP
            ? 'ビール、自家製乳酸発酵ピクルスとジンジャービア、そして「実際に何が必要か」という正直な話。スライドなし。'
            : 'Beers, my lactofermented pickles and ginger beer, and an honest conversation about what actually needs to happen here. No slides.'}
        </p>

        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          {isJP ? 'スロットを予約 →' : 'Grab a slot →'}
        </a>

        <p className="text-xs text-neutral-400 text-center mt-2.5">
          {isJP ? 'Apr 27–29 · 中目黒 · 1時間程度' : 'Apr 27–29 · central Tokyo · ~1 hr'}
        </p>
      </div>
    </div>
  );
}
