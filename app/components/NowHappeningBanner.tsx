'use client';

import Link from 'next/link';
import { Session } from '../types';
import { useLanguage } from './LanguageProvider';
import { isHappeningNow } from '../utils/time';

interface NowHappeningBannerProps {
  sessions: Session[];
}

export default function NowHappeningBanner({ sessions }: NowHappeningBannerProps) {
  const { t } = useLanguage();
  const now = new Date();

  // Check if we're in conference dates (Apr 27-29 2026)
  const isConferenceDates = now >= new Date('2026-04-27') && now <= new Date('2026-04-29T23:59:59');

  // Check if it's during conference hours (9:30-18:00 JST)
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const isConferenceHours = currentTimeInMinutes >= 570 && currentTimeInMinutes <= 1080; // 9:30-18:00

  if (!isConferenceDates || !isConferenceHours) {
    return null;
  }

  const currentSessions = sessions.filter(session =>
    isHappeningNow(session.time, session.day)
  );

  // If no current sessions, show next upcoming sessions
  const nextSessions = sessions
    .filter(session => {
      const [startTimeStr] = session.time.split('-');
      const [hour, minute] = startTimeStr.split(':').map(Number);
      const sessionTime = hour * 60 + minute;
      return sessionTime > currentTimeInMinutes;
    })
    .slice(0, 3);

  const displaySessions = currentSessions.length > 0 ? currentSessions : nextSessions;
  const title = currentSessions.length > 0 ? 'Now Happening' : 'Next Up';

  if (displaySessions.length === 0) {
    return null;
  }

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
            <h2 className="font-bold text-lg">{title}</h2>
          </div>
          <div className="flex-1 overflow-x-auto">
            <div className="flex space-x-6">
              {displaySessions.slice(0, 3).map((session) => (
                <Link
                  key={session.id}
                  href={`/session/${session.id}`}
                  className="flex-shrink-0 hover:text-yellow-200 transition-colors"
                >
                  <div className="text-sm">
                    <span className="font-medium">{session.time}</span>
                    <span className="mx-2">•</span>
                    <span className="opacity-90">{session.stage}</span>
                  </div>
                  <div className="font-medium truncate max-w-xs">
                    {t(session.title)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}