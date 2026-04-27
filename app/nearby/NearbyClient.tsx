'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../components/LanguageProvider';

interface NearbySpot {
  id: number;
  name: { en: string; jp: string };
  category: 'restaurant' | 'bar' | 'cafe';
  vibe: string[];
  description: { en: string; jp: string };
  tier: string;
  distance: { en: string; jp: string };
  transport: string;
  mapsUrl: string;
  priceRange: 1 | 2 | 3;
  hours: { en: string; jp: string };
  tags: string[];
}

function PriceRange({ n }: { n: number }) {
  return (
    <span className="font-mono text-sm">
      <span className="text-neutral-700">{'¥'.repeat(n)}</span>
      <span className="text-neutral-300">{'¥'.repeat(3 - n)}</span>
    </span>
  );
}

function SpotCard({ spot, t }: { spot: NearbySpot; t: (v: { en: string; jp: string }) => string }) {
  const categoryLabel = { restaurant: 'Restaurant', bar: 'Bar', cafe: 'Cafe' }[spot.category];

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col gap-3 hover:border-neutral-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-neutral-900 text-base leading-tight">
            {t(spot.name)}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
              {categoryLabel}
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

export default function NearbyClient() {
  const { t, language } = useLanguage();
  const [spots, setSpots] = useState<NearbySpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<FilterCategory>('all');

  useEffect(() => {
    fetch('/data/nearby.json')
      .then(r => r.json())
      .then(data => { setSpots(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const venueSpots = useMemo(() =>
    spots.filter(s => s.tier === 'walk' && (category === 'all' || s.category === category)),
    [spots, category]
  );

  const shimbashibSpots = useMemo(() =>
    spots.filter(s => s.tier === 'shimbashi' && (category === 'all' || s.category === category)),
    [spots, category]
  );

  const catBtnClass = (val: FilterCategory) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      category === val ? 'bg-primary text-primary-foreground' : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
    }`;

  const isJP = language === 'jp';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Hero direction */}
        <div className="bg-neutral-900 text-white rounded-xl p-6 mb-8">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            {isJP ? '結論' : 'The answer'}
          </div>
          <h1 className="text-2xl font-black mb-2">
            {isJP ? '新橋に行け' : 'Go to Shimbashi'}
          </h1>
          <p className="text-neutral-300 text-sm leading-relaxed">
            {isJP
              ? '会場正門前（国際展示場正門駅）からゆりかもめに乗る。乗り換えなし、終点が新橋。25分。着いたら高架下か烏森神社の路地に入る。焼き鳥、立ち飲み、ラーメン、立ち食い寿司。全部ある、全部安い。'
              : 'Get on the Yurikamome at the front gate (Kokusai-Tenjijo-Seimon). No transfers. Ride it to the last stop — Shimbashi. 25 minutes. Walk out and go under the tracks or into the Karasumori alleys. Yakitori, standing bars, ramen, standing sushi. All of it, all cheap.'}
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button className={catBtnClass('all')} onClick={() => setCategory('all')}>
            {isJP ? 'すべて' : 'All'}
          </button>
          <button className={catBtnClass('restaurant')} onClick={() => setCategory('restaurant')}>
            {isJP ? 'レストラン' : 'Restaurants'}
          </button>
          <button className={catBtnClass('bar')} onClick={() => setCategory('bar')}>
            {isJP ? 'バー・居酒屋' : 'Bars'}
          </button>
          <button className={catBtnClass('cafe')} onClick={() => setCategory('cafe')}>
            {isJP ? 'カフェ' : 'Cafes'}
          </button>
        </div>

        {loading ? (
          <div className="text-neutral-500 text-sm py-8 text-center">Loading...</div>
        ) : (
          <div className="space-y-8">
            {shimbashibSpots.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                  {isJP ? '新橋 — ゆりかもめで25分直通' : 'Shimbashi — 25 min direct on Yurikamome'}
                </h2>
                <div className="grid gap-4">
                  {shimbashibSpots.map(spot => (
                    <SpotCard key={spot.id} spot={spot} t={t} />
                  ))}
                </div>
              </section>
            )}

            {venueSpots.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                  {isJP ? '会場 — 歩いて行けるもの' : 'At the venue — what actually exists'}
                </h2>
                <div className="grid gap-4">
                  {venueSpots.map(spot => (
                    <SpotCard key={spot.id} spot={spot} t={t} />
                  ))}
                </div>
              </section>
            )}

            {shimbashibSpots.length === 0 && venueSpots.length === 0 && (
              <div className="text-center py-12 text-neutral-600">
                {isJP ? 'フィルターに一致するスポットがありません。' : 'No spots match that filter.'}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-10 text-center">
          {isJP
            ? '※ 営業時間・定休日は変更になる場合があります。Googleマップで確認してからお出かけください。'
            : 'Hours change. Check Maps before you go.'}
        </p>
      </div>
    </div>
  );
}
