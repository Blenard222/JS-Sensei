'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { addPoints } from '@/lib/points';
import { useToast } from '@/app/components/Toast';
import questions from '@/data/questions.json';

export default function FlashcardsClient() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic') || 'variables_types';
  const { push } = useToast();

  const [mounted, setMounted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [idx, setIdx] = useState(0);
  const [custom, setCustom] = useState<{front: string, back: string}[]>([]);
  const [deck, setDeck] = useState<{front: string, back: string}[]>([]);

  const [frontInput, setFrontInput] = useState('');
  const [backInput, setBackInput] = useState('');

  useEffect(() => {
    setMounted(true);

    // Combine topic questions with custom cards
    const topicCards = questions
      .filter(q => q.topic === topic)
      .map(q => ({ 
        front: q.prompt, 
        back: `${q.hint} • ${q.whyWrong}` 
      }));

    // Load custom cards from localStorage
    const storedCustom = localStorage.getItem(`custom_cards_${topic}`);
    const parsedCustom = storedCustom ? JSON.parse(storedCustom) : [];

    const combinedDeck = [...topicCards, ...parsedCustom];
    setDeck(combinedDeck);

    // Load last viewed card index
    const storedIndex = localStorage.getItem(`flash_${topic}_index`);
    if (storedIndex && combinedDeck.length > 0) {
      const parsedIndex = parseInt(storedIndex, 10);
      if (parsedIndex >= 0 && parsedIndex < combinedDeck.length) {
        setIdx(parsedIndex);
      }
    }
  }, [topic]);

  const onFlip = () => {
    setIsFlipped(f => !f);
  };

  const onPrev = () => {
    if (idx > 0) {
      const newIdx = idx - 1;
      setIdx(newIdx);
      setIsFlipped(false);
      localStorage.setItem(`flash_${topic}_index`, newIdx.toString());
    }
  };

  const onNext = () => {
    if (idx < deck.length - 1) {
      const newIdx = idx + 1;
      setIdx(newIdx);
      setIsFlipped(false);
      localStorage.setItem(`flash_${topic}_index`, newIdx.toString());
    }
  };

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
    
    // Reset inputs
    setFrontInput('');
    setBackInput('');
  };

  if (!mounted) {
    return (
      <main className="container-narrow section-tight">
        <section className="card min-h-[160px]">Loading…</section>
      </main>
    );
  }

  const current = deck[idx] || { front: 'No cards', back: 'Add some cards to get started!' };

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

        <div className="flex items-center justify-center gap-3" tabIndex={0}>
          <button 
            className="btn btn-ghost" 
            onClick={onPrev} 
            disabled={idx === 0}
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
            disabled={idx === deck.length - 1}
          >
            Next
          </button>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Add your own card</h2>
        <input
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900"
          placeholder="Card front (question)"
          value={frontInput}
          onChange={(e) => setFrontInput(e.target.value)}
        />
        <textarea
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900"
          placeholder="Card back (answer)"
          value={backInput}
          onChange={(e) => setBackInput(e.target.value)}
          rows={3}
        />
        <div className="flex gap-3">
          <button 
            className="btn btn-primary" 
            onClick={addCard}
            disabled={!frontInput.trim() || !backInput.trim()}
          >
            Add Card
          </button>
          <button 
            className="btn btn-ghost" 
            onClick={() => {
              setFrontInput('');
              setBackInput('');
            }}
          >
            Clear
          </button>
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
          className="btn btn-ghost"
        >
          Go to Quiz
        </Link>
      </div>
    </main>
  );
}
