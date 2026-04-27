'use client';

import { useState, useEffect } from 'react';
import { Session, Speaker } from '../types';

export function useData() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [sessionsRes, speakersRes] = await Promise.all([
          fetch('/data/sessions.json'),
          fetch('/data/speakers.json')
        ]);

        if (!sessionsRes.ok || !speakersRes.ok) {
          throw new Error('Failed to load data');
        }

        const [sessionsData, speakersData] = await Promise.all([
          sessionsRes.json(),
          speakersRes.json()
        ]);

        setSessions(sessionsData);
        setSpeakers(speakersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { sessions, speakers, loading, error };
}