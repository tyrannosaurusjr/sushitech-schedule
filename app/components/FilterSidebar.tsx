'use client';

import { Session, Day } from '../types';
import { useLanguage } from './LanguageProvider';
import { getDayDate } from '../utils/time';

interface FilterSidebarProps {
  sessions: Session[];
  selectedDay: Day | null;
  selectedStages: string[];
  selectedCategory: string | null;
  searchQuery: string;
  showFavoritesOnly: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onDayChange: (day: Day | null) => void;
  onStageChange: (stage: string) => void;
  onCategoryChange: (category: string | null) => void;
  onSearchChange: (query: string) => void;
  onFavoritesToggle: () => void;
}

export default function FilterSidebar({
  sessions,
  selectedDay,
  selectedStages,
  selectedCategory,
  searchQuery,
  showFavoritesOnly,
  isOpen,
  onToggle,
  onDayChange,
  onStageChange,
  onCategoryChange,
  onSearchChange,
  onFavoritesToggle
}: FilterSidebarProps) {
  const { t } = useLanguage();

  // Normalize and deduplicate stages and categories
  const uniqueStages = Array.from(
    new Set(sessions.map(s => s.stage.trim()).filter(Boolean))
  ).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .filter((stage, i, arr) => arr.findIndex(s => s.toLowerCase() === stage.toLowerCase()) === i);

  const uniqueCategories = Array.from(
    new Set(sessions.map(s => t(s.category).trim()).filter(Boolean))
  ).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .filter((cat, i, arr) => arr.findIndex(c => c.toLowerCase() === cat.toLowerCase()) === i);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-auto
          h-full lg:h-auto w-80 lg:w-64
          bg-white border-r border-neutral-200
          transform transition-transform lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:block
        `}
      >
        <div className="p-6 space-y-6 h-full overflow-y-auto">
          {/* Header with close button for mobile */}
          <div className="flex items-center justify-between lg:hidden">
            <h3 className="font-bold text-lg">Filters</h3>
            <button onClick={onToggle} className="p-2 hover:bg-neutral-100 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Session title, speaker, company..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* My Sessions Toggle */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={onFavoritesToggle}
                className="rounded border-neutral-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-neutral-700">My Sessions</span>
            </label>
          </div>

          {/* Days */}
          <div>
            <h4 className="font-medium text-neutral-900 mb-3">Day</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="day"
                  checked={selectedDay === null}
                  onChange={() => onDayChange(null)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-neutral-700">All days</span>
              </label>
              {(['Day1', 'Day2', 'Day3'] as Day[]).map((day) => (
                <label key={day} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="day"
                    checked={selectedDay === day}
                    onChange={() => onDayChange(day)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-neutral-700">{getDayDate(day)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-medium text-neutral-900 mb-3">Category</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === null}
                  onChange={() => onCategoryChange(null)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-neutral-700">All categories</span>
              </label>
              {uniqueCategories.map((category) => (
                <label key={category} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category}
                    onChange={() => onCategoryChange(category)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-neutral-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Stages */}
          <div>
            <h4 className="font-medium text-neutral-900 mb-3">Stage</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {uniqueStages.map((stage) => (
                <label key={stage} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStages.includes(stage)}
                    onChange={() => onStageChange(stage)}
                    className="rounded border-neutral-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-neutral-700">{stage}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}