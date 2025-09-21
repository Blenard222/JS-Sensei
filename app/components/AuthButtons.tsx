'use client';

import { useEffect, useState } from 'react';
import { supabase, hasSupabase } from '@/lib/supabaseClient';

type Props = { showSignIn?: boolean };

export default function AuthButtons({ showSignIn = true }: Props) {
  // Hooks must be called unconditionally at the top:
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    // If Supabase isn't configured, just mark ready so render can return null safely
    if (!hasSupabase || !supabase) {
      setReady(true);
      return;
    }

    const loadUserAndPoints = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user ?? null;
      setEmail(user?.email ?? null);

      if (user) {
        try {
          const { data: prof } = await supabase
            .from('profiles')
            .select('points')
            .eq('id', user.id)
            .single();

          const pts = Number(prof?.points ?? 0);
          localStorage.setItem('points', String(pts));
          window.dispatchEvent(
            new CustomEvent('points-changed', { detail: { points: pts } })
          );
        } catch {
          // ignore; keep UI responsive
        }
      }
      setReady(true);
    };

    loadUserAndPoints();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      const user = session?.user ?? null;
      setEmail(user?.email ?? null);

      if (user) {
        try {
          const { data: prof } = await supabase
            .from('profiles')
            .select('points')
            .eq('id', user.id)
            .single();
          const pts = Number(prof?.points ?? 0);
          localStorage.setItem('points', String(pts));
          window.dispatchEvent(
            new CustomEvent('points-changed', { detail: { points: pts } })
          );
        } catch {
          // ignore
        }
      } else {
        // signed out: clear local state
        localStorage.removeItem('points');
        localStorage.removeItem('mastery');
        window.dispatchEvent(
          new CustomEvent('points-changed', { detail: { points: 0 } })
          );
      }
    });

    return () => sub?.subscription?.unsubscribe();
  }, []);

  // Render gates AFTER hooks:
  if (!hasSupabase || !supabase) return null;
  if (!ready) return null;

  if (email) {
    return (
      <div className="flex items-center gap-2 max-w-full">
        <span
          className="hidden sm:inline text-sm text-gray-700 max-w-[200px] md:max-w-[260px] whitespace-nowrap overflow-hidden text-ellipsis"
          title={email}
        >
          User: {email}
        </span>
        <button
          className="btn btn-ghost whitespace-nowrap"
          onClick={async () => {
            await supabase.auth.signOut();
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  if (!showSignIn) return null;

  return (
    <button
      className="btn whitespace-nowrap"
      onClick={() =>
        supabase!.auth.signInWithOAuth({
          provider: 'github',
          options: { redirectTo: window.location.origin },
        })
      }
    >
      Sign in with GitHub
    </button>
  );
}
