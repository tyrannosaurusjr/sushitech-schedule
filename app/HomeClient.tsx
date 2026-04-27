'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useData } from './hooks/useData';
import { useFavorites } from './hooks/useFavorites';
import { useLanguage } from './components/LanguageProvider';
import { Session, Day } from './types';
import NowHappeningBanner from './components/NowHappeningBanner';
import FilterSidebar from './components/FilterSidebar';
import SessionCard from './components/SessionCard';
import TimetableView from './components/TimetableView';

type ViewMode = 'list' | 'timetable';

export default function HomeClient() {
  const { sessions, loading, error } = useData();
  const { favorites } = useFavorites();
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

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
      // Day filter
      if (selectedDay && session.day !== selectedDay) {
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
  }, [sessions, selectedDay, selectedStages, selectedCategory, searchQuery, showFavoritesOnly, favorites, t]);

  // Sort sessions by day, then time
  const sortedSessions = useMemo(() => {
    return [...filteredSessions].sort((a, b) => {
      // First sort by day
      const dayOrder = { 'Day1': 1, 'Day2': 2, 'Day3': 3 };
      const dayDiff = dayOrder[a.day as keyof typeof dayOrder] - dayOrder[b.day as keyof typeof dayOrder];
      if (dayDiff !== 0) return dayDiff;

      // Then sort by time
      const [aStart] = a.time.split('-');
      const [bStart] = b.time.split('-');
      return aStart.localeCompare(bStart);
    });
  }, [filteredSessions]);

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

          <div className="flex-1 lg:ml-64">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 hover:bg-neutral-100 rounded-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h1 className="text-2xl font-black text-neutral-900">
                    Conference Schedule
                  </h1>
                  {filteredSessions.length > 0 && (
                    <span className="text-neutral-600">
                      ({filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>

                {/* View toggle */}
                <div className="flex bg-neutral-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('timetable')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'timetable'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Timetable
                  </button>
                </div>
              </div>

              {/* Content */}
              {filteredSessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-lg font-medium text-neutral-900 mb-2">
                    No sessions found
                  </div>
                  <div className="text-neutral-600">
                    Try adjusting your filters or search query
                  </div>
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