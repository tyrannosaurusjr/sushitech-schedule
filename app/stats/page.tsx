import { Metadata } from 'next';
import { Suspense } from 'react';
import StatsClient from './StatsClient';

export const metadata: Metadata = {
  title: 'Stats | SusHi Tech Tokyo 2026',
  description: 'Conference statistics: sessions, speakers, stages, and categories at SusHi Tech Tokyo 2026.',
};

export default function StatsPage() {
  return (
    <Suspense>
      <StatsClient />
    </Suspense>
  );
}
