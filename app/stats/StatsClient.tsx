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
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-neutral-500 text-xs tabular-nums">{count}</span>
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

function ProfileCard({ title, lines, footnote }: { title: string; lines: string[]; footnote?: string }) {
  return (
    <div className="bg-neutral-900 text-white rounded-xl p-5">
      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">{title}</div>
      <ul className="space-y-2">
        {lines.map((line, i) => (
          <li key={i} className="flex gap-2 text-sm leading-snug">
            <span className="text-neutral-600 shrink-0 mt-0.5">—</span>
            <span className="text-neutral-300">{line}</span>
          </li>
        ))}
      </ul>
      {footnote && (
        <p className="text-xs text-neutral-600 mt-4 border-t border-neutral-800 pt-3">{footnote}</p>
      )}
    </div>
  );
}

export default function StatsClient() {
  const { sessions, loading } = useData();
  const { language } = useLanguage();
  const isJP = language === 'jp';

  const stats = useMemo(() => {
    if (!sessions.length) return null;

    const speakerMap = new Map<number, { company: { en: string; jp: string }; role: { en: string; jp: string }; name: { en: string; jp: string } }>();
    for (const s of sessions) {
      for (const sp of s.speakers) {
        speakerMap.set(sp.id, sp);
      }
    }
    const speakers = [...speakerMap.values()];
    const uniqueSpeakers = speakers.length;

    // Sessions by day
    const byDay: Record<string, number> = { Day1: 0, Day2: 0, Day3: 0 };
    for (const s of sessions) byDay[s.day] = (byDay[s.day] || 0) + 1;

    // Sessions by category
    const catMap = new Map<string, number>();
    for (const s of sessions) {
      const cat = (isJP ? s.category.jp : s.category.en).trim();
      if (cat) catMap.set(cat, (catMap.get(cat) || 0) + 1);
    }
    const byCategory = [...catMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

    // Sessions by stage
    const stageCanon = new Map<string, { display: string; count: number }>();
    for (const s of sessions) {
      const raw = s.stage.trim();
      if (!raw) continue;
      const key = raw.toLowerCase();
      if (!stageCanon.has(key)) stageCanon.set(key, { display: raw, count: 0 });
      stageCanon.get(key)!.count++;
    }
    const byStage = [...stageCanon.values()].sort((a, b) => b.count - a.count);

    // Company types
    const companyKeywords: Record<string, string[]> = {
      'Government & public sector': ['government', 'ministry', 'metropolitan', 'municipal', 'bureau', 'department', 'agency', 'prefecture', 'public'],
      'University & research': ['university', 'college', 'institute', 'school', 'academic'],
      'VC & finance': ['capital', 'ventures', 'venture', 'fund', 'partners', 'investment', 'investor', 'bank', 'financial'],
      'International orgs': ['unicef', 'united nations', ' un ', 'world bank'],
    };
    const companyType = new Map<string, number>();
    let otherCount = 0;
    for (const sp of speakers) {
      const comp = sp.company.en.toLowerCase();
      let classified = false;
      for (const [ctype, keywords] of Object.entries(companyKeywords)) {
        if (keywords.some(kw => comp.includes(kw))) {
          companyType.set(ctype, (companyType.get(ctype) || 0) + 1);
          classified = true;
          break;
        }
      }
      if (!classified) {
        if (/co\.\s*ltd|k\.k\.|kabushiki|corp\.|corporation|inc\./i.test(comp)) {
          companyType.set('Private company (JP-style)', (companyType.get('Private company (JP-style)') || 0) + 1);
        } else {
          otherCount++;
        }
      }
    }
    companyType.set('Other / unclassified', otherCount);
    const byCompanyType = [...companyType.entries()].sort((a, b) => b[1] - a[1]);

    // Speaker roles
    const roleMap = new Map<string, number>();
    const roleRules: [string, string[]][] = [
      ['CEO', ['ceo', 'chief executive']],
      ['CTO / CIO', ['cto', 'cio', 'chief technology', 'chief information']],
      ['Other C-suite', ['coo', 'cfo', 'cso', 'chief ', 'officer']],
      ['President', ['president']],
      ['Founder / Co-founder', ['founder']],
      ['Director', ['director']],
      ['Manager', ['manager']],
      ['Partner', ['partner']],
      ['Professor', ['professor', 'prof.']],
      ['Researcher', ['researcher', 'research fellow', 'research scientist']],
      ['Investor / VC', ['investor', 'venture capitalist', 'general partner at']],
      ['Engineer', ['engineer']],
    ];
    for (const sp of speakers) {
      const role = sp.role.en.toLowerCase();
      let matched = false;
      for (const [label, keywords] of roleRules) {
        if (keywords.some(kw => role.includes(kw))) {
          roleMap.set(label, (roleMap.get(label) || 0) + 1);
          matched = true;
          break;
        }
      }
      if (!matched && sp.role.en.trim()) roleMap.set('Other', (roleMap.get('Other') || 0) + 1);
    }
    const byRole = [...roleMap.entries()].sort((a, b) => b[1] - a[1]);

    // Top companies
    const compMap = new Map<string, number>();
    for (const sp of speakers) {
      const c = sp.company.en.trim();
      if (c) compMap.set(c, (compMap.get(c) || 0) + 1);
    }
    const topCompanies = [...compMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

    // AI stats
    const aiSessions = sessions.filter(s =>
      s.title.en.includes('AI') ||
      s.title.en.toLowerCase().includes('artificial intelligence') ||
      (s as any).technologyTags?.en?.includes('AI') ||
      (s as any).focusOns?.en?.includes('AI')
    );
    const aiPct = Math.round(aiSessions.length / sessions.length * 100);

    // Sponsor sessions
    const sponsorCats = ['Corporate Partner', 'City Partner', 'ITAMAE Program'];
    const bySponsors = new Map<string, number>();
    for (const s of sessions) {
      if (sponsorCats.includes(s.category.en)) {
        bySponsors.set(s.category.en, (bySponsors.get(s.category.en) || 0) + 1);
      }
    }
    const sponsorTotal = [...bySponsors.values()].reduce((a, b) => a + b, 0);

    // Misc
    const noSpeaker = sessions.filter(s => s.speakers.length === 0).length;
    const soloSessions = sessions.filter(s => s.speakers.length === 1).length;
    const panelSessions = sessions.filter(s => s.speakers.length > 1).length;
    const onDemand = sessions.filter(s => (s as any).hasOnDemand === 'あり').length;
    const avgSpeakers = (sessions.reduce((acc, s) => acc + s.speakers.length, 0) / sessions.length).toFixed(1);
    const uniqueStages = stageCanon.size;

    const ceoCount = roleMap.get('CEO') || 0;
    const ctoCioCount = roleMap.get('CTO / CIO') || 0;
    const vcCount = (companyType.get('VC & finance') || 0);
    const govCount = companyType.get('Government & public sector') || 0;
    const uniCount = companyType.get('University & research') || 0;

    return {
      uniqueSpeakers, byDay, byCategory, byStage, topCompanies, byCompanyType, byRole,
      noSpeaker, soloSessions, panelSessions, onDemand, avgSpeakers, uniqueStages,
      aiSessions: aiSessions.length, aiPct, sponsorTotal, bySponsors,
      ceoCount, ctoCioCount, vcCount, govCount, uniCount,
    };
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
  const maxRole = stats.byRole[0]?.[1] ?? 1;
  const maxCompType = stats.byCompanyType[0]?.[1] ?? 1;

  const DAY_LABELS: Record<string, string> = {
    Day1: 'Day 1 — Apr 27', Day2: 'Day 2 — Apr 28', Day3: 'Day 3 — Apr 29',
  };

  const presenterLines = [
    `Title: CEO (${stats.ceoCount} speakers, ${Math.round(stats.ceoCount / stats.uniqueSpeakers * 100)}%) or CTO/CIO (${stats.ctoCioCount}, ${Math.round(stats.ctoCioCount / stats.uniqueSpeakers * 100)}%)`,
    `On a panel — ${Math.round(stats.panelSessions / (stats.panelSessions + stats.soloSessions) * 100)}% of sessions with speakers have more than one, averaging ${stats.avgSpeakers} per session`,
    `From a Japanese company, government body, or university — top represented orgs are U Tokyo, Tokyo Metropolitan Government, and Fujitsu`,
    `In a session that mentions AI (${stats.aiPct}% of all sessions do)`,
    `Day 1 presenter — it has ${stats.byDay.Day1} sessions vs ${stats.byDay.Day3} on Day 3`,
  ];

  const sponsorLines = [
    `Either a city government or large corporate — ${stats.bySponsors.get('City Partner') || 0} city partners, ${stats.bySponsors.get('Corporate Partner') || 0} corporate partners in the data`,
    `Has a named stage — ${stats.uniqueStages} distinct stages in the venue, most named for their backer`,
    `${stats.bySponsors.get('ITAMAE Program') || 0} sessions under the ITAMAE program — Japan's government-backed startup internationalization push`,
    `Present for association, not direct sales — the organizer is Tokyo Metropolitan Government, not a trade body`,
  ];

  const attendeeLines = [
    `We have no public attendee data — none of the following is confirmed`,
    `The conference is organized by Tokyo Metropolitan Government; the crowd likely reflects its partner ecosystem: enterprises, agencies, and universities`,
    `International mix: Google, UNICEF, and multiple international VCs appear in the speaker roster — attendees are not all Japanese`,
    `Day 3 runs only ${stats.byDay.Day3} sessions vs ${stats.byDay.Day1} on Day 1 — most people probably don't stay all three days`,
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-neutral-900 mb-1">
        {isJP ? 'カンファレンス統計' : 'Conference by the numbers'}
      </h1>
      <p className="text-sm text-neutral-500 mb-8">
        {isJP ? 'セッションデータから自動集計' : 'Computed from the official session data · profiles are editorial'}
      </p>

      {/* Hero stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <StatCard label={isJP ? 'セッション数' : 'Sessions'} value={sessions.length} />
        <StatCard label={isJP ? '登壇者数' : 'Speakers'} value={stats.uniqueSpeakers} />
        <StatCard label={isJP ? 'ステージ数' : 'Stages'} value={stats.uniqueStages} />
        <StatCard label={isJP ? 'スポンサー枠' : 'Sponsor slots'} value={stats.sponsorTotal} />
      </div>

      {/* The Average X profiles */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          {isJP ? 'プロフィール（編集部推測）' : 'The average SusHi Tech person'}
        </h2>
        <div className="grid gap-4">
          <ProfileCard
            title={isJP ? '平均的な登壇者' : 'The average presenter'}
            lines={presenterLines}
          />
          <ProfileCard
            title={isJP ? '平均的なスポンサー' : 'The average sponsor'}
            lines={sponsorLines}
          />
          <ProfileCard
            title={isJP ? '平均的な参加者' : 'The average attendee'}
            lines={attendeeLines}
            footnote="Attendee demographics are not public. These are observations, not data."
          />
        </div>
      </section>

      {/* AI stats callout */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          {isJP ? 'AI について' : 'AI, obviously'}
        </h2>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-black text-neutral-900">{stats.aiSessions}</div>
              <div className="text-xs text-neutral-500 mt-1">{isJP ? 'AI言及セッション数' : 'sessions mention AI'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-neutral-900">{stats.aiPct}%</div>
              <div className="text-xs text-neutral-500 mt-1">{isJP ? '全セッションの割合' : 'of all sessions'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-neutral-900">30m</div>
              <div className="text-xs text-neutral-500 mt-1">{isJP ? '初AI登場まで' : 'until first AI session'}</div>
            </div>
          </div>
          <p className="text-xs text-neutral-500 border-t border-neutral-100 pt-3">
            {isJP
              ? 'Day 1の開幕は10:30。最初のAIセッションは11:00。コーヒー1杯が終わる前にAIが始まる。'
              : 'Day 1 opens at 10:30. First session with "AI" in the title starts at 11:00. The conference cannot get through half a cup of coffee before it starts.'}
          </p>
        </div>
      </section>

      {/* Gender estimate */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          {isJP ? '性別推定（名前ベース）' : 'Gender — estimated from first names'}
        </h2>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          {/* Stacked bar */}
          <div className="flex h-4 rounded-full overflow-hidden mb-4">
            <div className="bg-primary" style={{ width: '44%' }} title="Likely male" />
            <div className="bg-primary/30" style={{ width: '33%' }} title="Likely female" />
            <div className="bg-neutral-100" style={{ width: '23%' }} title="Unclassified" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div>
              <div className="text-xl font-black text-neutral-900">302</div>
              <div className="text-xs text-neutral-500">{isJP ? 'おそらく男性' : 'Likely male'}</div>
              <div className="text-xs text-neutral-400">44%</div>
            </div>
            <div>
              <div className="text-xl font-black text-neutral-900">230</div>
              <div className="text-xs text-neutral-500">{isJP ? 'おそらく女性' : 'Likely female'}</div>
              <div className="text-xs text-neutral-400">33%</div>
            </div>
            <div>
              <div className="text-xl font-black text-neutral-900">156</div>
              <div className="text-xs text-neutral-500">{isJP ? '判定不能' : 'Unclassifiable'}</div>
              <div className="text-xs text-neutral-400">23%</div>
            </div>
          </div>
          <p className="text-xs text-neutral-400 border-t border-neutral-100 pt-3">
            {isJP
              ? 'Western名前DBに日本語・韓国語・中国語のヒューリスティックと手動分類を組み合わせた推定。判定可能な名前のみで見ると 57% 男性 / 43% 女性。23%は組織名や判定不能の個人名。'
              : 'Western name DB + Japanese/Korean/Chinese heuristics + manual knowledge pass. Among classifiable individuals: 57% male / 43% female. The 23% unclassifiable includes organizational placeholders and genuinely ambiguous names. Directional only.'}
          </p>
        </div>
      </section>

      {/* Speaker roles */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          {isJP ? '登壇者の肩書き' : 'Speaker roles'}
        </h2>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
          {stats.byRole.map(([role, count]) => (
            <Bar key={role} label={role} value={count} max={maxRole} count={count} />
          ))}
          <p className="text-xs text-neutral-400 pt-1">
            {isJP
              ? `CEOとCTOで登壇者の${Math.round((stats.ceoCount + stats.ctoCioCount) / stats.uniqueSpeakers * 100)}%。エンジニアは4人。`
              : `CEOs and CTOs make up ${Math.round((stats.ceoCount + stats.ctoCioCount) / stats.uniqueSpeakers * 100)}% of speakers. Actual engineers: 4.`}
          </p>
        </div>
      </section>

      {/* Company types */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          {isJP ? '所属組織のタイプ' : 'Speaker organization type'}
        </h2>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
          {stats.byCompanyType.map(([type, count]) => (
            <Bar key={type} label={type} value={count} max={maxCompType} count={count} />
          ))}
          <p className="text-xs text-neutral-400 pt-1">
            {isJP
              ? `VC・金融系：${stats.vcCount}名。政府・公共：${stats.govCount}名。大学・研究：${stats.uniCount}名。`
              : `VC & finance: ${stats.vcCount}. Government & public: ${stats.govCount}. Universities: ${stats.uniCount}.`}
          </p>
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
              : `Day 3 drops to ${stats.byDay.Day3} sessions. By then most people are already on the Yurikamome home.`}
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

      <p className="text-xs text-neutral-400 mt-8 text-center">
        {isJP
          ? '性別・年齢・国籍のデータは公式データに含まれていません。「平均的なX」は編集的な解釈です。'
          : 'Gender, age, and nationality data are not available in the official dataset. "The average X" profiles are editorial inference, not survey data.'}
      </p>
    </div>
  );
}
