'use client';
import { useEffect, useState } from 'react';
import { useLocalMastery } from '../hooks/useLocalMastery';

export default function DemoMode() {
  const [isDemo, setIsDemo] = useState(false);
  const { mastery } = useLocalMastery();

  const progressString = `Mastery V ${Math.round(mastery.variables_types * 100)}% • A ${Math.round(mastery.arrays_objects * 100)}% • L ${Math.round(mastery.loops_conditionals * 100)}%`;

  const notify = () => document.dispatchEvent(new Event('demo-changed'));

  useEffect(() => {
    setIsDemo(localStorage.getItem('demo') === 'true');
  }, []);

  const enableDemo = () => {
    localStorage.setItem('demo', 'true');
    localStorage.setItem('mastery', JSON.stringify({
      variables_types: 0.67,
      arrays_objects: 0.33,
      loops_conditionals: 0,
    }));
    setIsDemo(true);
    notify();
  };

  const disableDemo = () => {
    localStorage.removeItem('demo');
    localStorage.removeItem('mastery');
    setIsDemo(false);
    notify();
  };

  return (
    <div className="flex items-center gap-2">
      {isDemo && <span className="badge">Demo User</span>}
      {isDemo ? (
        <button className="btn btn-ghost" onClick={disableDemo}>
          Disable Demo
          {isDemo && <span className="ml-2 text-sm text-gray-600">{progressString}</span>}
        </button>
      ) : (
        <button className="btn" onClick={enableDemo}>
          Enable Demo
        </button>
      )}
    </div>
  );
}
