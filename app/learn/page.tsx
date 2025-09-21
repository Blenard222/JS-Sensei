'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import questions from '@/data/questions.json';

const TOPIC_META = {
  variables_types: {
    title: 'Variables & Types',
    blurb: 'Variables are containers for storing data values. JavaScript has different types like numbers, strings, and booleans, each with unique characteristics.',
    code: 'let age = 25;  // number\nconst name = "Alice";  // string',
    defaultHint: 'Use let for changeable values, const for constants that won\'t change.'
  },
  arrays_objects: {
    title: 'Arrays & Objects',
    blurb: 'Arrays store lists of items, while objects store key-value pairs. They help organize and structure data in complex ways.',
    code: 'let fruits = ["apple", "banana"];\nlet person = { name: "Bob", age: 30 };',
    defaultHint: 'Arrays use square brackets [], objects use curly braces {}. Arrays are ordered, objects use key-value pairs.'
  },
  loops_conditionals: {
    title: 'Loops & Conditionals',
    blurb: 'Loops help repeat actions, while conditionals make decisions in code. They control the flow of your program based on different conditions.',
    code: 'if (age >= 18) {\n  console.log("Adult");\n}\nfor (let i = 0; i < 5; i++) { ... }',
    defaultHint: 'if checks conditions, for repeats code a specific number of times.'
  },
  functions: {
    title: 'Functions',
    blurb: 'Functions are reusable blocks of code that perform specific tasks. They can take inputs, process them, and return results.',
    code: 'function greet(name) {\n  return `Hello, ${name}!`;\n}',
    defaultHint: 'Functions help you organize code and avoid repetition.'
  },
  methods_core: {
    title: 'Must-Know Methods',
    blurb: 'JavaScript provides powerful built-in methods for arrays and objects. These methods help transform, filter, and manipulate data efficiently.',
    code: '[1,2,3].map(x => x * 2);\n// Returns [2,4,6]',
    defaultHint: 'map() transforms each element, filter() selects elements, reduce() combines elements.'
  },
  async_await: {
    title: 'Async/Await',
    blurb: 'Async/await provides a clean way to handle asynchronous operations. It allows you to write asynchronous code that looks and behaves like synchronous code.',
    code: 'async function fetchData() {\n  const response = await fetch(url);\n  return response.json();\n}',
    defaultHint: 'async functions always return a promise, await pauses execution until a promise resolves.'
  },
  apis_event_loop: {
    title: 'APIs & Event Loop',
    blurb: 'The event loop is how JavaScript handles asynchronous operations. It manages the execution of multiple chunks of code over time, allowing non-blocking operations.',
    code: 'setTimeout(() => {\n  console.log("After timeout");\n}, 0);',
    defaultHint: 'setTimeout pushes a callback to the next event loop iteration.'
  },
  intro_js: {
    title: 'JS Intro',
    blurb: 'JavaScript is a versatile programming language primarily used for web interactivity. It allows you to create dynamic and interactive web experiences.',
    code: 'console.log("Hello, JavaScript!");\nlet x = 42;\nconsole.log(typeof x);',
    defaultHint: 'JavaScript is a high-level, interpreted programming language.'
  }
};

export default function Learn() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic') || 'variables_types';

  const [showStaticHint, setShowStaticHint] = useState(false);
  const [aiHint, setAiHint] = useState('');
  const [isLoadingAiHint, setIsLoadingAiHint] = useState(false);

  // New state for Ask Tutor
  const [userQ, setUserQ] = useState('');
  const [tutorAns, setTutorAns] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  // Find first question for the current topic
  const topicQuestions = questions.filter(q => q.topic === topic);
  const firstQuestion = topicQuestions[0];

  const currentMeta = TOPIC_META[topic as keyof typeof TOPIC_META];

  const handleStaticHint = () => {
    setShowStaticHint(true);
  };

  const handleAiHint = async () => {
    setIsLoadingAiHint(true);
    setAiHint('');

    try {
      const response = await fetch('/api/hint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          prompt: currentMeta.blurb,
          wrongChoice: null
        })
      });

      const data = await response.json();
      setAiHint(data.hint);
    } catch (error) {
      console.error('Failed to get AI hint:', error);
      setAiHint('Sorry, could not generate a hint right now.');
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
        <label className="font-semibold"> 
          Sensei&apos;s Wisdom:
          </label>
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
            {asking ? 'Thinking…' : 'Ask Sensei'}
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
            <p className="font-semibold mb-1">Sensei</p>
            <p className="text-gray-900 whitespace-pre-wrap">{tutorAns}</p>
          </div>
        )}
      </section>

      <div className="text-center mt-4 flex justify-center gap-3">
        <Link 
          href={`/quiz?topic=${topic}`} 
          className="btn btn-ghost"
        >
          Go to quiz
        </Link>
        <Link 
          href={`/flashcards?topic=${topic}`} 
          className="btn btn-ghost"
        >
          Use flashcards
        </Link>
      </div>
    </main>
  );
}
