'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useData } from '../hooks/useData';
import { useLanguage } from '../components/LanguageProvider';
import { Speaker } from '../types';

export default function SpeakersClient() {
  const { speakers, sessions, loading, error } = useData();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Get session count for each speaker
  const speakerSessionCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    speakers.forEach(speaker => {
      counts[speaker.id] = sessions.filter(session =>
        session.speakerIds.includes(speaker.id)
      ).length;
    });
    return counts;
  }, [speakers, sessions]);

  // Filter speakers based on search
  const filteredSpeakers = useMemo(() => {
    if (!searchQuery) return speakers;

    const query = searchQuery.toLowerCase();
    return speakers.filter(speaker =>
      t(speaker.name).toLowerCase().includes(query) ||
      t(speaker.company).toLowerCase().includes(query) ||
      t(speaker.role).toLowerCase().includes(query)
    );
  }, [speakers, searchQuery, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-lg text-neutral-600">Loading speakers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-lg text-red-600">Error loading data: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-neutral-900 mb-4">
            Speakers
          </h1>

          {/* Search */}
          <div className="max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search speakers..."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {filteredSpeakers.length > 0 && (
            <p className="mt-4 text-neutral-600">
              {filteredSpeakers.length} speaker{filteredSpeakers.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Speakers Grid */}
        {filteredSpeakers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-lg font-medium text-neutral-900 mb-2">
              No speakers found
            </div>
            <div className="text-neutral-600">
              Try adjusting your search query
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSpeakers.map((speaker) => (
              <Link
                key={speaker.id}
                href={`/?speaker=${speaker.id}`}
                className="group bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Speaker Image */}
                  <div className="w-20 h-20 mb-4 overflow-hidden rounded-lg">
                    <img
                      src={speaker.image || '/placeholder-avatar.svg'}
                      alt={t(speaker.name)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-avatar.svg';
                      }}
                    />
                  </div>

                  {/* Speaker Info */}
                  <h3 className="font-bold text-lg text-neutral-900 mb-1 group-hover:text-primary transition-colors">
                    {t(speaker.name)}
                  </h3>

                  <p className="text-sm text-neutral-600 mb-1">
                    {t(speaker.company)}
                  </p>

                  <p className="text-sm text-neutral-500 mb-3">
                    {t(speaker.role)}
                  </p>

                  {/* Session Count */}
                  <div className="bg-primary/10 text-primary px-2 py-1 text-xs font-medium rounded">
                    {speakerSessionCounts[speaker.id] || 0} session{speakerSessionCounts[speaker.id] !== 1 ? 's' : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}