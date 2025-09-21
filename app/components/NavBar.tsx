'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase, hasSupabase } from '@/lib/supabaseClient';
import { getPoints, beltFor, loadPointsFromSupabase } from '@/lib/points';

// Helper functions for belt display
const BELT_SHORT: Record<string, string> = { 
  White: 'W', Yellow: 'Y', Green: 'G', Blue: 'B', 
  Brown: 'Br', Black: 'Bk' 
};

const BELT_COLOR: Record<string, string> = { 
  White: 'text-gray-700', Yellow: 'text-yellow-500', 
  Green: 'text-green-500', Blue: 'text-blue-500', 
  Brown: 'text-amber-700', Black: 'text-black' 
};

function shortBelt(label: string) {
  return BELT_SHORT[label] ?? label?.[0] ?? '?';
}

function beltClass(label: string) {
  return BELT_COLOR[label] ?? 'text-gray-700';
}

function avatarFromEmail(email?: string | null) {
  const ch = email?.trim()?.[0]?.toUpperCase() ?? 'U';
  return ch;
}

export default function NavBar() {
  const pathname = usePathname();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [pts, setPts] = useState(0);
  const [belt, setBelt] = useState('White');

  function navClass(href: string) {
    const base = "px-3 py-1 text-sm rounded-full hover:bg-gray-100 whitespace-nowrap";
    const active = "text-red-600 font-semibold";
    const inactive = "text-gray-700";
    return `${base} ${pathname.startsWith(href) ? active : inactive}`;
  }

  const handleSignOut = async () => {
    if (!hasSupabase || !supabase) return;
    await supabase.auth.signOut();

    // Clear points and mastery on sign-out
    localStorage.removeItem('points');
    localStorage.removeItem('mastery');

    // Dispatch points change event
    window.dispatchEvent(new CustomEvent('points-changed', {
      detail: { points: 0 }
    }));
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      // initial session check
      const { supabase } = await import('@/lib/supabaseClient').catch(() => ({ supabase: null }));
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        const signedIn = !!session?.user;
        setIsSignedIn(signedIn);
        setEmail(session?.user?.email ?? null);

        if (signedIn) {
          await loadPointsFromSupabase(); // hydrate points into localStorage + event
        }

        const { data: sub } = supabase.auth.onAuthStateChange(async (evt, sess) => {
          const nowSignedIn = !!sess?.user;
          setIsSignedIn(nowSignedIn);
          setEmail(sess?.user?.email ?? null);

          if (nowSignedIn) {
            await loadPointsFromSupabase();
          } else {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('points');
              window.dispatchEvent(new CustomEvent('points-changed', { detail: { points: 0 } }));
            }
          }
        });
        unsubscribe = () => sub?.subscription?.unsubscribe();
      }

      // still initialize local points to show something until Supabase loads
      const p = getPoints();
      setPts(p);
      setBelt(beltFor(p));
    })();

    function onPoints(e: Event) {
      const detail = (e as CustomEvent).detail as { points: number } | undefined;
      const newPts = detail?.points ?? getPoints();
      setPts(newPts);
      setBelt(beltFor(newPts));
    }
    window.addEventListener('points-changed', onPoints);
    window.addEventListener('storage', onPoints);

    return () => {
      window.removeEventListener('points-changed', onPoints);
      window.removeEventListener('storage', onPoints);
      unsubscribe?.();
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
      <div className="container-narrow h-14 flex items-center justify-between gap-4">
        {/* Left: brand */}
        <Link href="/" className="font-semibold whitespace-nowrap">
          ⛩️ <span className="font-bold">JS Sensei</span>
        </Link>

        {/* Center: nav */}
        <nav className="flex items-center gap-3">
          <Link 
            href="/topics" 
            className={navClass('/topics')}
          >
            Topics
          </Link>
          <Link 
            href="/diagnostic" 
            className={navClass('/diagnostic')}
          >
            Diagnostic
          </Link>
          <Link 
            href="/flashcards?topic=variables_types" 
            className={navClass('/flashcards')}
          >
            Flashcards
          </Link>
        </nav>

        {/* Right: account controls */}
        <div className="ml-auto flex items-center gap-2">
          {/* Compact belt • points chip */}
          {isSignedIn && (
            <span
              className="hidden sm:inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium whitespace-nowrap"
              title={`${belt} • ${pts} points`}
            >
              <span aria-hidden className="text-base leading-none">🥋</span>
              <span className={beltClass(belt)}>{shortBelt(belt)}</span>
              <span className="text-gray-700">• {pts}</span>
            </span>
          )}

          {/* Tiny avatar with email tooltip */}
          {isSignedIn && email && (
            <span
              className="hidden md:inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700 select-none"
              title={email}
              aria-label={`Signed in as ${email}`}
            >
              {avatarFromEmail(email)}
            </span>
          )}

          {/* Sign out */}
          {isSignedIn && (
            <button onClick={handleSignOut} className="btn btn-ghost whitespace-nowrap">
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
