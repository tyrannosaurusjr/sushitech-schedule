import { Suspense } from 'react';
import HomeClient from './HomeClient';

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="text-lg text-neutral-600">Loading...</div></div>}>
      <HomeClient />
    </Suspense>
  );
}
