'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Session } from '../types';
import { useLanguage } from './LanguageProvider';
import { getStageFloor, parseTime } from '../utils/time';

interface TimetableViewProps {
  sessions: Session[];
}

const DAY_LABELS: Record<string, string> = {
  Day1: 'Mon 27 Apr',
  Day2: 'Tue 28 Apr',
  Day3: 'Wed 29 Apr',
};

const CANONICAL_STAGES = [
  'Atrium Stage',
  'Green Stage',
  'Impact Stage',
  'Japan Stage',
  'Meteor Stage',
  'Open Innovation Stage',
  'Sun Pillar Stage',
  'Wind Stage',
  'Innovation Stage',
  'Investor Stage',
  'ITAMAE Stage',
  'SusHi Tech Global Stage',
  'Tokyo Stage',
];

// Normalize stage names to canonical form (handle typos/case variants in data)
function canonicalizeStage(stage: string): string {
  const lower = stage.toLowerCase();
  for (const cs of CANONICAL_STAGES) {
    if (cs.toLowerCase() === lower) return cs;
  }
  return stage;
}

const START_HOUR = 9;   // 09:00
const END_HOUR = 19;    // 19:00
const PX_PER_MIN = 2.5; // vertical scale

function minutesSinceDayStart(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function sessionTopPx(startTime: string): number {
  const mins = minutesSinceDayStart(startTime) - START_HOUR * 60;
  return Math.max(0, mins * PX_PER_MIN);
}

function sessionHeightPx(startTime: string, endTime: string): number {
  const startMins = minutesSinceDayStart(startTime);
  const endMins = minutesSinceDayStart(endTime);
  return Math.max(30, (endMins - startMins) * PX_PER_MIN);
}

const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * 60 * PX_PER_MIN;

const HOUR_MARKS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

export default function TimetableView({ sessions }: TimetableViewProps) {
  const { t } = useLanguage();
  const [activeDay, setActiveDay] = useState<string>('Day1');

  const daySessions = sessions.filter(s => s.day === activeDay);

  // Build canonical stage list: only stages that have sessions on this day
  const stagesWithSessions = Array.from(
    new Set(daySessions.map(s => canonicalizeStage(s.stage)))
  ).sort((a, b) => {
    const floorA = getStageFloor(a) || '9F';
    const floorB = getStageFloor(b) || '9F';
    if (floorA !== floorB) return floorA.localeCompare(floorB);
    return a.localeCompare(b);
  });

  // Group sessions by canonical stage
  const sessionsByStage: Record<string, Session[]> = {};
  for (const session of daySessions) {
    const cs = canonicalizeStage(session.stage);
    if (!sessionsByStage[cs]) sessionsByStage[cs] = [];
    sessionsByStage[cs].push(session);
  }

  function getFloorColors(stage: string) {
    const floor = getStageFloor(stage);
    if (floor === '1F') return { bg: '#FDF6EC', border: '#E8D5B0', text: '#92400e' };
    if (floor === '4F') return { bg: '#EFF6FF', border: '#BFDBFE', text: '#1e3a8a' };
    return { bg: '#F5F5F5', border: '#D4D4D4', text: '#404040' };
  }

  const STAGE_COL_WIDTH = 180;
  const TIME_COL_WIDTH = 56;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
      {/* Day selector */}
      <div className="flex border-b border-neutral-200 bg-neutral-50">
        {Object.entries(DAY_LABELS).map(([day, label]) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeDay === day
                ? 'bg-white text-primary border-b-2 border-primary'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Timetable */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: TIME_COL_WIDTH + stagesWithSessions.length * STAGE_COL_WIDTH }}>
          {/* Stage headers */}
          <div className="flex border-b border-neutral-200 bg-neutral-50 sticky top-0 z-10">
            <div style={{ width: TIME_COL_WIDTH, minWidth: TIME_COL_WIDTH }} className="shrink-0 border-r border-neutral-200" />
            {stagesWithSessions.map(stage => {
              const floor = getStageFloor(stage);
              const colors = getFloorColors(stage);
              return (
                <div
                  key={stage}
                  style={{ width: STAGE_COL_WIDTH, minWidth: STAGE_COL_WIDTH, borderLeftColor: colors.border, borderLeftWidth: 1 }}
                  className="px-2 py-3 border-r border-neutral-200 last:border-r-0"
                >
                  <div className="text-xs font-semibold text-neutral-800 leading-tight">{stage}</div>
                  {floor && (
                    <div
                      className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {floor}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid body */}
          <div className="flex">
            {/* Time axis */}
            <div
              style={{ width: TIME_COL_WIDTH, minWidth: TIME_COL_WIDTH, height: TOTAL_HEIGHT }}
              className="relative shrink-0 border-r border-neutral-200 bg-neutral-50"
            >
              {HOUR_MARKS.map(hour => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-t border-neutral-200 flex items-start px-1.5"
                  style={{ top: (hour - START_HOUR) * 60 * PX_PER_MIN }}
                >
                  <span className="text-[10px] text-neutral-500 leading-none mt-0.5">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Stage columns */}
            {stagesWithSessions.map(stage => {
              const colors = getFloorColors(stage);
              const stageSessions = sessionsByStage[stage] || [];

              return (
                <div
                  key={stage}
                  style={{
                    width: STAGE_COL_WIDTH,
                    minWidth: STAGE_COL_WIDTH,
                    height: TOTAL_HEIGHT,
                    backgroundColor: colors.bg + '55',
                  }}
                  className="relative border-r border-neutral-200 last:border-r-0"
                >
                  {/* Hour grid lines */}
                  {HOUR_MARKS.map(hour => (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 border-t border-neutral-200"
                      style={{ top: (hour - START_HOUR) * 60 * PX_PER_MIN }}
                    />
                  ))}
                  {/* Half-hour marks */}
                  {HOUR_MARKS.slice(0, -1).map(hour => (
                    <div
                      key={`${hour}:30`}
                      className="absolute left-0 right-0 border-t border-neutral-100 border-dashed"
                      style={{ top: (hour - START_HOUR) * 60 * PX_PER_MIN + 30 * PX_PER_MIN }}
                    />
                  ))}

                  {/* Session cards */}
                  {stageSessions.map(session => {
                    const [startStr, endStr] = session.time.split(/[-~]/);
                    const top = sessionTopPx(startStr);
                    const height = sessionHeightPx(startStr, endStr);
                    const short = height < 60;

                    return (
                      <Link
                        key={session.id}
                        href={`/session/${session.id}`}
                        className="absolute left-1 right-1 rounded overflow-hidden hover:shadow-md transition-shadow group"
                        style={{
                          top: top + 1,
                          height: height - 2,
                          backgroundColor: colors.bg,
                          borderLeft: `3px solid ${colors.border}`,
                          borderTop: `1px solid ${colors.border}`,
                          borderRight: `1px solid ${colors.border}`,
                          borderBottom: `1px solid ${colors.border}`,
                          zIndex: 2,
                        }}
                      >
                        <div className="px-1.5 py-1 h-full flex flex-col">
                          <div className="text-[9px] font-medium opacity-60" style={{ color: colors.text }}>
                            {session.time}
                          </div>
                          <div
                            className={`text-[11px] font-semibold leading-tight mt-0.5 ${short ? 'line-clamp-1' : 'line-clamp-3'}`}
                            style={{ color: '#1a1a1a' }}
                          >
                            {t(session.title)}
                          </div>
                          {!short && session.speakers.length > 0 && (
                            <div className="text-[10px] opacity-70 line-clamp-1 mt-0.5" style={{ color: colors.text }}>
                              {session.speakers.slice(0, 2).map(s => t(s.name)).join(', ')}
                              {session.speakers.length > 2 && ` +${session.speakers.length - 2}`}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center gap-6 text-xs text-neutral-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#FDF6EC', border: '1px solid #E8D5B0' }} />
          1st Floor (1F)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }} />
          4th Floor (4F)
        </div>
        <span className="ml-auto opacity-60">Scroll horizontally to see all stages →</span>
      </div>
    </div>
  );
}
