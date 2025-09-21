'use client';

import { Suspense } from 'react';
import FlashcardsClient from './FlashcardsClient';

export default function Page() {
  return (
    <Suspense fallback={
      <main className="container-narrow section-tight">
        <div className="card">Loading…</div>
      </main>
    }>
      <FlashcardsClient />
    </Suspense>
  );
}
