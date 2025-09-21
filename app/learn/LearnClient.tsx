'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const TOPIC_META = {
  variables_types: {
    title: 'Variables & Types',
    blurb: 'Learn how to store and manipulate data in JavaScript.',
    code: 'let name = "JS Sensei";\nconst age = 42;\nvar isLearning = true;',
    defaultHint: 'Variables store data. Use let, const, or var to declare them.'
  },
  // ... other existing topic meta entries from previous implementation
};

export default function LearnClient() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic') || 'variables_types';

  const [showStaticHint, setShowStaticHint] = useState(false);
  const [isLoadingAiHint, setIsLoadingAiHint] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [userQ, setUserQ] = useState('');
  const [tutorAns, setTutorAns] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  const currentMeta = TOPIC_META[topic as keyof typeof TOPIC_META] || TOPIC_META.variables_types;

  const handleStaticHint = () => {
    setShowStaticHint(true);
  };

  const handleAiHint = async () => {
    setIsLoadingAiHint(true);
    setAiHint(null);
    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, prompt: currentMeta.blurb })
      });
      const data = await res.json();
      setAiHint(typeof data?.hint === 'string' ? data.hint : 'Sorry, I could not generate an answer.');
    } catch {
      setAiHint('Network error. Please try again.');
    } finally {
      setIsLoadingAiHint(false);
    }
  };

  return (
    <main className="container-narrow section-tight space-y-4">
      <section className="card space-y-4">
        <div className="flex items-center space-x-2">
          <span className="badge">{currentMeta.title}</span>
          <h1 className="text-xl font-semibold text-gray-900">{currentMeta.title}</h1>
        </div>
        <div className="divider-dojo" />

        <p className="text-gray-900">{currentMeta.blurb}</p>
        <div className="code-card">
          <pre><code>{currentMeta.code}</code></pre>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleStaticHint}
            className="btn btn-ghost mr-2"
            disabled={showStaticHint}
          >
            Show hint
          </button>
          <button
            onClick={handleAiHint}
            className="btn btn-primary"
            disabled={isLoadingAiHint}
          >
            {isLoadingAiHint ? 'Thinking...' : 'Explain differently'}
          </button>
        </div>

        {showStaticHint && (
          <div className="bg-blue-50 p-2 rounded-md">
            <p className="text-gray-900">{currentMeta.defaultHint}</p>
          </div>
        )}

        {aiHint && (
          <div className="bg-green-50 p-2 rounded-md">
            <p className="text-gray-900">{aiHint}</p>
          </div>
        )}
      </section>

      <section className="card space-y-3">
        <label className="font-semibold">Ask Tutor</label>
        <textarea
          className="w-full rounded-xl border border-gray-300 px-3 py-2"
          value={userQ}
          onChange={(e) => setUserQ(e.target.value)}
          placeholder="Ask anything about this topic…"
          rows={3}
        />
        <div className="flex gap-3">
          <button
            className="btn btn-primary"
            disabled={!userQ.trim() || asking}
            onClick={async () => {
              setAsking(true);
              setTutorAns(null);
              try {
                const res = await fetch('/api/hint', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ topic, prompt: userQ.trim() })
                });
                const data = await res.json();
                setTutorAns(typeof data?.hint === 'string' ? data.hint : 'Sorry, I could not generate an answer.');
              } catch {
                setTutorAns('Network error. Please try again.');
              } finally {
                setAsking(false);
              }
            }}
          >
            {asking ? 'Thinking…' : 'Ask Tutor'}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => { setUserQ(''); setTutorAns(null); }}
            disabled={asking && !tutorAns}
          >
            Clear
          </button>
        </div>
        {tutorAns && (
          <div className="bg-gray-100 p-3 rounded-md" role="status">
            <p className="font-semibold mb-1">Tutor</p>
            <p className="text-gray-900 whitespace-pre-wrap">{tutorAns}</p>
          </div>
        )}
      </section>

      <div className="text-center mt-4 flex justify-center gap-3">
        <Link
          href={`/quiz?topic=${topic}`}
          className="btn btn-ghost"
        >
          Go to Quiz
        </Link>
        <Link
          href={`/flashcards?topic=${topic}`}
          className="btn btn-ghost"
        >
          Use Flashcards
        </Link>
      </div>
    </main>
  );
}
