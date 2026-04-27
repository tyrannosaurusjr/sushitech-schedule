'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useData } from './hooks/useData';
import { useFavorites } from './hooks/useFavorites';
import { useLanguage } from './components/LanguageProvider';
import { Session, Day } from './types';
import { isHappeningNow, getTodayDay } from './utils/time';
import NowHappeningBanner from './components/NowHappeningBanner';
import FilterSidebar from './components/FilterSidebar';
import SessionCard from './components/SessionCard';
import TimetableView from './components/TimetableView';

type ViewMode = 'list' | 'timetable' | 'my-schedule';

export default function HomeClient() {
  const { sessions, loading, error } = useData();
  const { favorites } = useFavorites();
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Day | null>(getTodayDay() as Day | null);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showLiveOnly, setShowLiveOnly] = useState(false);

  // Check for speaker filter from URL
  const speakerIdFromUrl = searchParams?.get('speaker');

  // Set initial search if speaker is in URL
  useEffect(() => {
    if (speakerIdFromUrl && sessions.length > 0) {
      const speakerId = parseInt(speakerIdFromUrl);
      const speaker = sessions.flatMap(s => s.speakers).find(sp => sp.id === speakerId);
      if (speaker) {
        setSearchQuery(t(speaker.name));
      }
    }
  }, [speakerIdFromUrl, sessions, t]);

  // Filter sessions based on current filters
  const filteredSessions = useMemo(() => {
    if (!sessions.length) return [];

    return sessions.filter(session => {
      // Day filter (skip if live-only is on — isHappeningNow already checks day)
      if (!showLiveOnly && selectedDay && session.day !== selectedDay) {
        return false;
      }

      // Stage filter
      if (selectedStages.length > 0 && !selectedStages.includes(session.stage)) {
        return false;
      }

      // Category filter
      if (selectedCategory && t(session.category) !== selectedCategory) {
        return false;
      }

      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(session.id)) {
        return false;
      }

      // Live now filter
      if (showLiveOnly && !isHappeningNow(session.time, session.day)) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = t(session.title).toLowerCase().includes(query);
        const speakerMatch = session.speakers.some(speaker =>
          t(speaker.name).toLowerCase().includes(query) ||
          t(speaker.company).toLowerCase().includes(query)
        );
        const categoryMatch = t(session.category).toLowerCase().includes(query);
        const themeMatch = t(session.themes).toLowerCase().includes(query);

        if (!titleMatch && !speakerMatch && !categoryMatch && !themeMatch) {
          return false;
        }
      }

      return true;
    });
  }, [sessions, selectedDay, selectedStages, selectedCategory, searchQuery, showFavoritesOnly, showLiveOnly, favorites, t]);

  const dayOrder = { 'Day1': 1, 'Day2': 2, 'Day3': 3 } as const;
  const sortByDayTime = (a: Session, b: Session) => {
    const dayDiff = (dayOrder[a.day as keyof typeof dayOrder] ?? 0) - (dayOrder[b.day as keyof typeof dayOrder] ?? 0);
    if (dayDiff !== 0) return dayDiff;
    const [aStart] = a.time.split('-');
    const [bStart] = b.time.split('-');
    return aStart.localeCompare(bStart);
  };

  // Sort sessions by day, then time
  const sortedSessions = useMemo(() => [...filteredSessions].sort(sortByDayTime), [filteredSessions]);

  // My Schedule: all favorited sessions across all days, sorted by day+time
  const myScheduleSessions = useMemo(() =>
    [...sessions].filter(s => favorites.includes(s.id)).sort(sortByDayTime),
    [sessions, favorites]
  );

  const DAY_LABELS: Record<string, string> = { Day1: 'Day 1 — Apr 27', Day2: 'Day 2 — Apr 28', Day3: 'Day 3 — Apr 29' };

  const handleStageChange = (stage: string) => {
    setSelectedStages(prev =>
      prev.includes(stage)
        ? prev.filter(s => s !== stage)
        : [...prev, stage]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-lg text-neutral-600">Loading schedule...</div>
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
      <NowHappeningBanner sessions={sessions} />

      <div className="max-w-7xl mx-auto">
        <div className="flex">
          <FilterSidebar
            sessions={sessions}
            selectedDay={selectedDay}
            selectedStages={selectedStages}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            showFavoritesOnly={showFavoritesOnly}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            onDayChange={setSelectedDay}
            onStageChange={handleStageChange}
            onCategoryChange={setSelectedCategory}
            onSearchChange={setSearchQuery}
            onFavoritesToggle={() => setShowFavoritesOnly(!showFavoritesOnly)}
          />

          <div className="flex-1 lg:ml-64 min-w-0">
            <div className="p-6">
              {/* Header */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 hover:bg-neutral-100 rounded-md shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h1 className="text-xl sm:text-2xl font-black text-neutral-900 truncate">
                    Conference Schedule
                  </h1>
                  {filteredSessions.length > 0 && (
                    <span className="text-neutral-600 text-sm shrink-0">
                      ({filteredSessions.length})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Live filter */}
                  <button
                    onClick={() => setShowLiveOnly(!showLiveOnly)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      showLiveOnly
                        ? 'bg-red-500 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${showLiveOnly ? 'bg-white animate-pulse' : 'bg-red-400'}`} />
                    Live
                  </button>

                  {/* View toggle */}
                  <div className="flex bg-neutral-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      List
                    </button>
                    <button
                      onClick={() => setViewMode('timetable')}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        viewMode === 'timetable' ? 'bg-white text-primary shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      Timetable
                    </button>
                    <button
                      onClick={() => setViewMode('my-schedule')}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                        viewMode === 'my-schedule' ? 'bg-white text-primary shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill={viewMode === 'my-schedule' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span className="hidden sm:inline">Mine</span>
                      {myScheduleSessions.length > 0 && (
                        <span className="text-xs bg-primary/10 text-primary rounded-full px-1.5 py-0.5 leading-none">
                          {myScheduleSessions.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              {viewMode === 'my-schedule' ? (
                myScheduleSessions.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-4xl mb-4">☆</div>
                    <div className="text-lg font-medium text-neutral-900 mb-2">No sessions starred yet</div>
                    <div className="text-neutral-600 text-sm">Tap the star on any session to add it here</div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(['Day1', 'Day2', 'Day3'] as const).map(day => {
                      const daySessions = myScheduleSessions.filter(s => s.day === day);
                      if (daySessions.length === 0) return null;
                      return (
                        <div key={day}>
                          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                            {DAY_LABELS[day]}
                          </h2>
                          <div className="grid gap-4">
                            {daySessions.map(session => (
                              <SessionCard key={session.id} session={session} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-lg font-medium text-neutral-900 mb-2">No sessions found</div>
                  <div className="text-neutral-600">Try adjusting your filters or search query</div>
                </div>
              ) : (
                <>
                  {viewMode === 'list' ? (
                    <div className="grid gap-4">
                      {sortedSessions.map((session) => (
                        <SessionCard key={session.id} session={session} />
                      ))}
                    </div>
                  ) : (
                    <TimetableView sessions={sortedSessions} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}