'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import questions from '@/data/questions.json';
import { addPoints, beltFor } from '@/lib/points';
import { useToast } from '@/app/components/Toast';

type Card = { front: string; back: string };

export default function FlashcardsPage() {
  const { push } = useToast();
  const params = useSearchParams();
  const topic = params.get('topic') || 'variables_types';

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [custom, setCustom] = useState<Card[]>([]);
  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = localStorage.getItem(`custom_cards_${topic}`);
      setCustom(raw ? (JSON.parse(raw) as Card[]) : []);
    } catch {
      setCustom([]);
    }
  }, [mounted, topic]);

  const builtIns: Card[] = useMemo(() => {
    return questions
      .filter((q) => q.topic === topic)
      .map((q) => ({
        front: q.prompt,
        back: (q.hint?.trim() || '') + (q.whyWrong ? ` • ${q.whyWrong.trim()}` : ''),
      }));
  }, [topic]);

  const deck = useMemo<Card[]>(() => [...custom, ...builtIns], [custom, builtIns]);

  const [idx, setIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIdx(0);
    setIsFlipped(false);
  }, [topic, deck.length]);

  const canPrev = idx > 0;
  const canNext = idx < Math.max(deck.length - 1, 0);

  const onPrev = () => {
    if (!canPrev) return;
    setIdx((i) => Math.max(0, i - 1));
    setIsFlipped(false);
  };
  const onNext = () => {
    if (!canNext) return;
    setIdx((i) => Math.min(deck.length - 1, i + 1));
    setIsFlipped(false);
  };
  const onFlip = () => setIsFlipped((f) => !f);

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
      onFlip();
    } else if (e.key === 'ArrowLeft') {
      onPrev();
    } else if (e.key === 'ArrowRight') {
      onNext();
    }
  };

  const [frontInput, setFrontInput] = useState('');
  const [backInput, setBackInput] = useState('');
  const addCard = async () => {
    if (!frontInput.trim() || !backInput.trim()) return;
    
    const next = [...custom, { front: frontInput.trim(), back: backInput.trim() }];
    setCustom(next);
    try {
      localStorage.setItem(`custom_cards_${topic}`, JSON.stringify(next));
      
      // Add points for creating a new flashcard
      const pts = await addPoints(20);
      push({ 
        title: 'Card Created!', 
        message: '+20 XP for creating a new flashcard!' 
      });
    } catch {}
    
    setFrontInput('');
    setBackInput('');
    setIdx(next.length - 1);
    setIsFlipped(false);
  };

  const deleteLastCustom = () => {
    if (custom.length === 0) return;
    const next = custom.slice(0, -1);
    setCustom(next);
    try {
      localStorage.setItem(`custom_cards_${topic}`, JSON.stringify(next));
    } catch {}
    setIdx((i) => Math.min(i, Math.max(next.length + builtIns.length - 1, 0)));
    setIsFlipped(false);
  };

  if (!mounted) {
    return (
      <main className="container-narrow py-6">
        <section className="card min-h-[160px]">Loading…</section>
      </main>
    );
  }

  const current = deck[idx] ?? { front: 'No cards for this topic yet.', back: '' };

  return (
    <main className="container-narrow section-tight space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Flashcards</h1>
        <span className="text-gray-900">
          Card {deck.length === 0 ? 0 : idx + 1} of {deck.length}
        </span>
      </header>
      <div className="divider-dojo" />

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Add your own card</h2>
        <input
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900"
          placeholder="Front (question)"
          value={frontInput}
          onChange={(e) => setFrontInput(e.target.value)}
        />
        <textarea
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900"
          placeholder="Back (answer / hint)"
          rows={3}
          value={backInput}
          onChange={(e) => setBackInput(e.target.value)}
        />
        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={addCard}>
            Add card
          </button>
          <button 
            className="btn btn-ghost" 
            onClick={deleteLastCustom} 
            disabled={custom.length === 0}
          >
            Delete last custom
          </button>
        </div>
      </section>

      <section className="card space-y-4">
        <div className="flip-wrap">
          <div className={`flip-inner ${isFlipped ? 'is-flipped' : ''}`}>
            <div className="flip-face flip-front">
              <p className="text-gray-900">{current.front}</p>
            </div>
            <div className="flip-face flip-back">
              <p className="text-gray-900">{current.back || 'No back defined.'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3" tabIndex={0} onKeyDown={onKey}>
          <button 
            className="btn btn-ghost" 
            onClick={onPrev} 
            disabled={!canPrev}
          >
            Previous
          </button>
          <button
            className="btn"
            onClick={(e) => {
              e.stopPropagation();
              onFlip();
            }}
          >
            Flip
          </button>
          <button 
            className="btn btn-ghost" 
            onClick={onNext} 
            disabled={!canNext}
          >
            Next
          </button>
        </div>

        <div className="text-center text-sm text-gray-900">
          Card {deck.length === 0 ? 0 : idx + 1} of {deck.length}
        </div>
      </section>

      <div className="text-center flex justify-center gap-3">
        <Link 
          href={`/learn?topic=${topic}`} 
          className="btn btn-ghost"
        >
          Back to Learn
        </Link>
        <Link 
          href={`/quiz?topic=${topic}`} 
          className="btn btn-primary"
        >
          Quiz this topic
        </Link>
      </div>
    </main>
  );
}
