'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import Link from 'next/link';
import { useData } from '../../hooks/useData';
import { useLanguage } from '../../components/LanguageProvider';
import { useFavorites } from '../../hooks/useFavorites';
import { getStageFloor, getDayDate } from '../../utils/time';

export default function SessionDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { sessions, loading, error } = useData();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();

  const sessionId = typeof params.id === 'string' ? parseInt(params.id) : null;

  const session = useMemo(() => {
    if (!sessionId || !sessions.length) return null;
    return sessions.find(s => s.id === sessionId) || null;
  }, [sessionId, sessions]);

  const generateCalendarLink = () => {
    if (!session) return '';

    const title = encodeURIComponent(t(session.title));
    const details = encodeURIComponent(t(session.overview));
    const location = encodeURIComponent(`${session.stage}, Tokyo Big Sight`);

    // Convert day to actual date
    const dayMap: Record<string, string> = {
      'Day1': '20260427',
      'Day2': '20260428',
      'Day3': '20260429'
    };

    const [startTime, endTime] = session.time.split('-');
    const startDateTime = `${dayMap[session.day]}T${startTime.replace(':', '')}00`;
    const endDateTime = `${dayMap[session.day]}T${endTime.replace(':', '')}00`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${endDateTime}&details=${details}&location=${location}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-lg text-neutral-600">Loading session...</div>
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

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-lg font-medium text-neutral-900 mb-2">
          Session not found
        </div>
        <div className="text-neutral-600 mb-4">
          The session you're looking for doesn't exist.
        </div>
        <Link
          href="/"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Back to Schedule
        </Link>
      </div>
    );
  }

  const floor = getStageFloor(session.stage);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-neutral-600 hover:text-neutral-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to schedule
        </button>

        {/* Session Header */}
        <div className="bg-white border border-neutral-200 rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-medium rounded-full">
                  {getDayDate(session.day)}
                </span>
                <span className="font-medium text-primary text-lg">
                  {session.time}
                </span>
                <span className="bg-neutral-100 px-3 py-1 text-sm rounded">
                  {session.stage} {floor && `• ${floor}`}
                </span>
              </div>

              <h1 className="text-3xl font-black text-neutral-900 mb-4 leading-tight">
                {t(session.title)}
              </h1>

              <div className="flex items-center space-x-2">
                <span className="bg-primary/10 text-primary px-3 py-1 text-sm font-medium rounded">
                  {t(session.category)}
                </span>
                {session.themes.en && (
                  <span className="bg-neutral-100 text-neutral-700 px-3 py-1 text-sm rounded">
                    {t(session.themes)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => toggleFavorite(session.id)}
              className={`p-2 rounded-lg ${
                isFavorite(session.id)
                  ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50'
                  : 'text-neutral-400 hover:text-yellow-500 hover:bg-yellow-50'
              } transition-colors`}
              title="Add to My Sessions"
            >
              <svg
                className="w-6 h-6"
                fill={isFavorite(session.id) ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-4">
            <a
              href={generateCalendarLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Add to Calendar
            </a>
            <a
              href={session.url}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-50 transition-colors"
            >
              Official Page
            </a>
          </div>
        </div>

        {/* Overview */}
        {session.overview.en && (
          <div className="bg-white border border-neutral-200 rounded-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Overview</h2>
            <div className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {t(session.overview)}
            </div>
          </div>
        )}

        {/* Speakers */}
        {session.speakers.length > 0 && (
          <div className="bg-white border border-neutral-200 rounded-lg p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">
              Speaker{session.speakers.length !== 1 ? 's' : ''} ({session.speakers.length})
            </h2>

            <div className="grid gap-6">
              {session.speakers.map((speaker) => (
                <div key={speaker.id} className="flex space-x-4">
                  {/* Speaker Image */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                    <img
                      src={speaker.image || '/placeholder-avatar.svg'}
                      alt={t(speaker.name)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-avatar.svg';
                      }}
                    />
                  </div>

                  {/* Speaker Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-neutral-900 mb-1">
                      {t(speaker.name)}
                    </h3>
                    <p className="text-neutral-600 mb-1">
                      {t(speaker.company)}
                    </p>
                    <p className="text-neutral-500 text-sm mb-3">
                      {t(speaker.role)}
                    </p>

                    {speaker.bio.en && (
                      <p className="text-neutral-700 leading-relaxed">
                        {t(speaker.bio)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}