'use client';

import { useMemo } from 'react';
import { useData } from '../hooks/useData';
import { useLanguage } from '../components/LanguageProvider';

function Bar({ value, max, label, count }: { value: number; max: number; label: string; count: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-44 shrink-0 text-neutral-700 truncate text-right text-xs">{label}</span>
      <div className="flex-1 bg-neutral-100 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-neutral-500 text-xs">{count}</span>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 text-center">
      <div className="text-3xl font-black text-neutral-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-neutral-700">{label}</div>
      {sub && <div className="text-xs text-neutral-400 mt-1">{sub}</div>}
    </div>
  );
}

export default function StatsClient() {
  const { sessions, loading } = useData();
  const { language } = useLanguage();
  const isJP = language === 'jp';

  const stats = useMemo(() => {
    if (!sessions.length) return null;

    // Unique speakers
    const speakerMap = new Map<number, string>();
    for (const s of sessions) {
      for (const sp of s.speakers) {
        speakerMap.set(sp.id, sp.company?.en || '');
      }
    }
    const uniqueSpeakers = speakerMap.size;

    // Sessions by day
    const byDay: Record<string, number> = { Day1: 0, Day2: 0, Day3: 0 };
    for (const s of sessions) byDay[s.day] = (byDay[s.day] || 0) + 1;

    // Sessions by category (non-empty, normalized)
    const catMap = new Map<string, number>();
    for (const s of sessions) {
      const cat = (isJP ? s.category.jp : s.category.en).trim();
      if (cat) catMap.set(cat, (catMap.get(cat) || 0) + 1);
    }
    const byCategory = [...catMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

    // Sessions by stage (normalize case)
    const stageCanon = new Map<string, { display: string; count: number }>();
    for (const s of sessions) {
      const raw = s.stage.trim();
      if (!raw) continue;
      const key = raw.toLowerCase();
      if (!stageCanon.has(key)) stageCanon.set(key, { display: raw, count: 0 });
      stageCanon.get(key)!.count++;
    }
    const byStage = [...stageCanon.values()].sort((a, b) => b.count - a.count);

    // Companies (by unique speaker count)
    const companyMap = new Map<string, number>();
    for (const [, company] of speakerMap) {
      if (company) companyMap.set(company, (companyMap.get(company) || 0) + 1);
    }
    const topCompanies = [...companyMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

    // No-speaker sessions
    const noSpeaker = sessions.filter(s => s.speakers.length === 0).length;

    // On demand
    const onDemand = sessions.filter(s => s.hasOnDemand === 'あり').length;

    // Avg speakers
    const totalSpeakerSlots = sessions.reduce((acc, s) => acc + s.speakers.length, 0);
    const avgSpeakers = (totalSpeakerSlots / sessions.length).toFixed(1);

    // Unique stages
    const uniqueStages = stageCanon.size;

    return { uniqueSpeakers, byDay, byCategory, byStage, topCompanies, noSpeaker, onDemand, avgSpeakers, uniqueStages };
  }, [sessions, isJP]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  const maxDay = Math.max(...Object.values(stats.byDay));
  const maxCat = stats.byCategory[0]?.[1] ?? 1;
  const maxStage = stats.byStage[0]?.count ?? 1;
  const maxCompany = stats.topCompanies[0]?.[1] ?? 1;

  const DAY_LABELS: Record<string, string> = {
    Day1: isJP ? 'Day 1 (4/27)' : 'Day 1 — Apr 27',
    Day2: isJP ? 'Day 2 (4/28)' : 'Day 2 — Apr 28',
    Day3: isJP ? 'Day 3 (4/29)' : 'Day 3 — Apr 29',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-neutral-900 mb-1">
        {isJP ? 'カンファレンス統計' : 'Conference by the numbers'}
      </h1>
      <p className="text-sm text-neutral-500 mb-8">
        {isJP ? 'セッションデータから自動集計' : 'Computed from the official session data'}
      </p>

      {/* Hero stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <StatCard label={isJP ? 'セッション数' : 'Sessions'} value={sessions.length} />
        <StatCard label={isJP ? '登壇者数' : 'Speakers'} value={stats.uniqueSpeakers} />
        <StatCard label={isJP ? 'ステージ数' : 'Stages'} value={stats.uniqueStages} />
        <StatCard label={isJP ? '開催日数' : 'Days'} value={3} />
      </div>

      {/* Sessions by day */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          {isJP ? '日別セッション数' : 'Sessions per day'}
        </h2>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
          {(['Day1', 'Day2', 'Day3'] as const).map(day => (
            <Bar key={day} label={DAY_LABELS[day]} value={stats.byDay[day]} max={maxDay} count={stats.byDay[day]} />
          ))}
          <p className="text-xs text-neutral-400 pt-1">
            {isJP
              ? `Day 3は${stats.byDay.Day3}セッションのみ — 実質的に閉会式`
              : `Day 3 has just ${stats.byDay.Day3} sessions — effectively the closing ceremony`}
          </p>
        </div>
      </section>

      {/* Sessions by stage */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          {isJP ? 'ステージ別セッション数' : 'Sessions by stage'}
        </h2>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
          {stats.byStage.map(({ display, count }) => (
            <Bar key={display} label={display} value={count} max={maxStage} count={count} />
          ))}
        </div>
      </section>

      {/* Sessions by category */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          {isJP ? 'カテゴリ別セッション数（上位10）' : 'Sessions by category (top 10)'}
        </h2>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
          {stats.byCategory.map(([cat, count]) => (
            <Bar key={cat} label={cat} value={count} max={maxCat} count={count} />
          ))}
        </div>
      </section>

      {/* Top companies */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          {isJP ? '登壇者数の多い組織（上位8）' : 'Most represented organizations'}
        </h2>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
          {stats.topCompanies.map(([company, count]) => (
            <Bar key={company} label={company} value={count} max={maxCompany} count={count} />
          ))}
        </div>
      </section>

      {/* Misc callouts */}
      <section>
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          {isJP ? 'その他' : 'Miscellaneous'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <div className="text-2xl font-black text-neutral-900">{stats.avgSpeakers}</div>
            <div className="text-sm text-neutral-600 mt-0.5">
              {isJP ? '平均登壇者数／セッション' : 'avg speakers per session'}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              {isJP ? 'ほぼすべてがパネル形式' : 'almost all panels'}
            </div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <div className="text-2xl font-black text-neutral-900">{stats.noSpeaker}</div>
            <div className="text-sm text-neutral-600 mt-0.5">
              {isJP ? '登壇者未掲載のセッション' : 'sessions with no speaker listed'}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              {isJP ? `全体の${Math.round(stats.noSpeaker / sessions.length * 100)}%` : `${Math.round(stats.noSpeaker / sessions.length * 100)}% of all sessions`}
            </div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <div className="text-2xl font-black text-neutral-900">{stats.onDemand}</div>
            <div className="text-sm text-neutral-600 mt-0.5">
              {isJP ? 'オンデマンド配信あり' : 'sessions with on-demand'}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              {isJP ? `全体の${Math.round(stats.onDemand / sessions.length * 100)}%` : `${Math.round(stats.onDemand / sessions.length * 100)}% of all sessions`}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
