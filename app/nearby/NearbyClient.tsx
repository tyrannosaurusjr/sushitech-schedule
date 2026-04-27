'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../components/LanguageProvider';

interface NearbySpot {
  id: number;
  name: { en: string; jp: string };
  category: 'restaurant' | 'bar' | 'cafe';
  vibe: string[];
  description: { en: string; jp: string };
  tier: 'walk' | 'shuttle' | 'train' | 'worth-the-trip';
  distance: { en: string; jp: string };
  transport: string;
  mapsUrl: string;
  priceRange: 1 | 2 | 3;
  hours: { en: string; jp: string };
  tags: string[];
}

const TIER_LABELS: Record<string, { en: string; jp: string; color: string }> = {
  walk:           { en: 'Walk',         jp: '徒歩',         color: 'bg-green-100 text-green-800' },
  shuttle:        { en: 'Shuttle bus',  jp: 'シャトルバス', color: 'bg-blue-100 text-blue-800' },
  train:          { en: 'Short train',  jp: '電車近距離',   color: 'bg-orange-100 text-orange-800' },
  'worth-the-trip': { en: 'Worth the trip', jp: '移動あり', color: 'bg-purple-100 text-purple-800' },
};

const CATEGORY_LABELS: Record<string, { en: string; jp: string }> = {
  restaurant: { en: 'Restaurant', jp: 'レストラン' },
  bar:        { en: 'Bar',        jp: 'バー・居酒屋' },
  cafe:       { en: 'Cafe',       jp: 'カフェ' },
};

const TRANSPORT_ICONS: Record<string, string> = {
  walk:  '🚶',
  bus:   '🚌',
  train: '🚆',
};

function PriceRange({ n }: { n: number }) {
  return (
    <span className="text-neutral-500 font-mono text-sm" title={`Price range: ${'¥'.repeat(n)}`}>
      {'¥'.repeat(n)}{'¥'.repeat(3 - n).split('').map(() => '').join('')}
      <span className="text-neutral-300">{'¥'.repeat(3 - n)}</span>
    </span>
  );
}

function SpotCard({ spot, t, language }: { spot: NearbySpot; t: (v: { en: string; jp: string }) => string; language: string }) {
  const tier = TIER_LABELS[spot.tier];
  const category = CATEGORY_LABELS[spot.category];

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col gap-3 hover:border-neutral-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-neutral-900 text-base leading-tight">
            {t(spot.name)}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
              {t(category)}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${tier.color}`}>
              {TRANSPORT_ICONS[spot.transport] || '🗺'} {language === 'jp' ? tier.jp : tier.en}
            </span>
            <PriceRange n={spot.priceRange} />
          </div>
        </div>
        <a
          href={spot.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Maps
        </a>
      </div>

      <p className="text-sm text-neutral-600 leading-relaxed">{t(spot.description)}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
        <span>{t(spot.distance)}</span>
        <span>{t(spot.hours)}</span>
      </div>
    </div>
  );
}

type FilterCategory = 'all' | 'restaurant' | 'bar' | 'cafe';
type FilterTier = 'all' | 'walk' | 'train' | 'worth-the-trip';

export default function NearbyClient() {
  const { t, language } = useLanguage();
  const [spots, setSpots] = useState<NearbySpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<FilterCategory>('all');
  const [tier, setTier] = useState<FilterTier>('all');

  useEffect(() => {
    fetch('/data/nearby.json')
      .then(r => r.json())
      .then(data => { setSpots(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return spots.filter(s => {
      if (category !== 'all' && s.category !== category) return false;
      if (tier === 'walk' && s.tier !== 'walk' && s.tier !== 'shuttle') return false;
      if (tier === 'train' && s.tier !== 'train') return false;
      if (tier === 'worth-the-trip' && s.tier !== 'worth-the-trip') return false;
      return true;
    });
  }, [spots, category, tier]);

  const catBtnClass = (val: FilterCategory) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      category === val ? 'bg-primary text-primary-foreground' : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
    }`;

  const tierBtnClass = (val: FilterTier) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      tier === val ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
    }`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-neutral-900 mb-1">
            {language === 'jp' ? '会場近くで食べる・飲む' : 'Eat & Drink Near the Venue'}
          </h1>
          <p className="text-sm text-neutral-500">
            {language === 'jp'
              ? '有明・東京ビッグサイト周辺のおすすめスポット。Matt Ketchumの個人的なキュレーション。必ず営業時間を確認してからお出かけください。'
              : 'Picked by Matt Ketchum — 10 years Tokyo. Ariake is convention land so some spots need a train. Always verify hours before heading out.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <button className={catBtnClass('all')} onClick={() => setCategory('all')}>
            {language === 'jp' ? 'すべて' : 'All'}
          </button>
          <button className={catBtnClass('restaurant')} onClick={() => setCategory('restaurant')}>
            {language === 'jp' ? 'レストラン' : 'Restaurants'}
          </button>
          <button className={catBtnClass('bar')} onClick={() => setCategory('bar')}>
            {language === 'jp' ? 'バー・居酒屋' : 'Bars'}
          </button>
          <button className={catBtnClass('cafe')} onClick={() => setCategory('cafe')}>
            {language === 'jp' ? 'カフェ' : 'Cafes'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button className={tierBtnClass('all')} onClick={() => setTier('all')}>
            {language === 'jp' ? '距離：すべて' : 'Any distance'}
          </button>
          <button className={tierBtnClass('walk')} onClick={() => setTier('walk')}>
            🚶 {language === 'jp' ? '徒歩圏内' : 'Walkable'}
          </button>
          <button className={tierBtnClass('train')} onClick={() => setTier('train')}>
            🚆 {language === 'jp' ? '電車近距離' : 'Short train'}
          </button>
          <button className={tierBtnClass('worth-the-trip')} onClick={() => setTier('worth-the-trip')}>
            🗺 {language === 'jp' ? '移動してでも行く価値あり' : 'Worth the trip'}
          </button>
        </div>

        {loading ? (
          <div className="text-neutral-500 text-sm py-8 text-center">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-neutral-600">No spots match those filters.</div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map(spot => (
              <SpotCard key={spot.id} spot={spot} t={t} language={language} />
            ))}
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-8 text-center">
          {language === 'jp'
            ? '※ 営業時間・定休日は変更になる場合があります。事前にご確認ください。'
            : 'Hours and closures change. Verify on Google Maps before you go.'}
        </p>
      </div>
    </div>
  );
}
