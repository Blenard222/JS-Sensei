'use client';

import Link from 'next/link';
import DemoMode from '../components/DemoMode';

const TOPICS = [
  {
    id: 'variables_types',
    name: 'Variables & Types',
    subtitle: 'Learn how to store and manipulate data in JavaScript'
  },
  {
    id: 'arrays_objects',
    name: 'Arrays & Objects',
    subtitle: 'Master complex data structures and collections'
  },
  {
    id: 'loops_conditionals',
    name: 'Loops & Conditionals',
    subtitle: 'Control program flow with decision-making and repetition'
  },
  {
    id: 'functions',
    name: 'Functions',
    subtitle: 'Create reusable code blocks with parameters and returns'
  },
  {
    id: 'methods_core',
    name: 'Must-Know Methods',
    subtitle: 'Transform arrays and objects with powerful built-in methods'
  },
  {
    id: 'async_await',
    name: 'Async/Await',
    subtitle: 'Handle asynchronous operations with clean, readable code'
  },
  {
    id: 'apis_event_loop',
    name: 'APIs & Event Loop',
    subtitle: 'Understand how JavaScript manages tasks and callbacks'
  },
  {
    id: 'intro_js',
    name: 'JS Intro',
    subtitle: 'Explore JavaScript fundamentals and core concepts'
  }
];

export default function Topics() {
  return (
    <main className="container-narrow section-tight">
      <header className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <DemoMode />
        </div>
      </header>

      <div className="space-y-3">
        {TOPICS.map((topic) => (
          <div 
            key={topic.id} 
            className="card flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-semibold">{topic.name}</div>
              <div className="text-sm text-gray-600">{topic.subtitle}</div>
            </div>
            <div className="flex gap-2">
              <Link 
                href={`/learn?topic=${topic.id}`} 
                className="btn btn-primary"
              >
                Learn
              </Link>
              <Link 
                href={`/flashcards?topic=${topic.id}`} 
                className="btn btn-ghost"
              >
                Flashcards
              </Link>
              <Link 
                href={`/quiz?topic=${topic.id}`} 
                className="btn btn-ghost"
              >
                Quiz
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
