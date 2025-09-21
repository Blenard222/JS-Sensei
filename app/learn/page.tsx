'use client';

import { Suspense } from 'react';
import LearnClient from './LearnClient';

export default function Page() {
  return (
    <Suspense fallback={
      <main className="container-narrow section-tight">
        <div className="card">Loading…</div>
      </main>
    }>
      <LearnClient />
    </Suspense>
  );
}
