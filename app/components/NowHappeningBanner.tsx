'use client';

import Link from 'next/link';
import { Session } from '../types';
import { useLanguage } from './LanguageProvider';
import { isHappeningNow, isUpNext } from '../utils/time';

interface NowHappeningBannerProps {
  sessions: Session[];
}

function SessionPill({ session, t }: { session: Session; t: (v: { en: string; jp: string }) => string }) {
  return (
    <Link
      href={`/session/${session.id}`}
      className="flex-shrink-0 hover:text-yellow-200 transition-colors"
    >
      <div className="text-xs opacity-75">
        {session.time} · {session.stage}
      </div>
      <div className="font-medium truncate max-w-xs text-sm">
        {t(session.title)}
      </div>
    </Link>
  );
}

export default function NowHappeningBanner({ sessions }: NowHappeningBannerProps) {
  const { t } = useLanguage();
  const now = new Date();

  const isConferenceDates = now >= new Date('2026-04-27') && now <= new Date('2026-04-29T23:59:59');
  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
  const isConferenceHours = currentTimeInMinutes >= 570 && currentTimeInMinutes <= 1080;

  if (!isConferenceDates || !isConferenceHours) return null;

  const currentSessions = sessions.filter(s => isHappeningNow(s.time, s.day));
  const upNextSessions = sessions.filter(s => isUpNext(s.time, s.day));

  if (currentSessions.length === 0 && upNextSessions.length === 0) return null;

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
        {currentSessions.length > 0 && (
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span className="font-bold text-sm whitespace-nowrap">Now</span>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-6">
                {currentSessions.slice(0, 4).map(s => (
                  <SessionPill key={s.id} session={s} t={t} />
                ))}
              </div>
            </div>
          </div>
        )}
        {upNextSessions.length > 0 && (
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              <span className="w-2 h-2 bg-yellow-300 rounded-full" />
              <span className="font-bold text-sm whitespace-nowrap">Up Next</span>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-6 opacity-80">
                {upNextSessions.slice(0, 4).map(s => (
                  <SessionPill key={s.id} session={s} t={t} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
