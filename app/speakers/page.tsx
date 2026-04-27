import type { Metadata } from 'next';
import SpeakersClient from './SpeakersClient';

export const metadata: Metadata = {
  title: 'Speakers | SusHi Tech Tokyo 2026',
  description: 'Browse all speakers at SusHi Tech Tokyo 2026 startup conference, April 27-29, 2026',
  openGraph: {
    title: 'Speakers | SusHi Tech Tokyo 2026',
    description: 'Browse all speakers at SusHi Tech Tokyo 2026 startup conference',
    type: 'website',
  },
};

export default function SpeakersPage() {
  return <SpeakersClient />;
}