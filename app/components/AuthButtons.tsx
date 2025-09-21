'use client';

import { useState, useEffect } from 'react';
import { supabase, hasSupabase } from '@/lib/supabaseClient';
import { loadPointsFromSupabase } from '@/lib/points';

export default function AuthButtons({ showSignIn = true }: { showSignIn?: boolean }) {
  const [email, setEmail] = useState<string | null>(null);
  const [canUseSupabase, setCanUseSupabase] = useState(false);

  useEffect(() => {
    const checkSupabase = async () => {
      setCanUseSupabase(hasSupabase && !!supabase);

      if (!hasSupabase || !supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);

      // Load points if user exists
      if (user) {
        await loadPointsFromSupabase();
      }
    };

    checkSupabase();

    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        const user = session?.user;
        setEmail(user?.email ?? null);

        // Load points on first sign-in
        if (user) {
          await loadPointsFromSupabase();
        }
      });

      return () => {
        data.subscription.unsubscribe();
      };
    }

    return () => {};
  }, []);

  const handleSignIn = async () => {
    if (!canUseSupabase || !supabase) return;

    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleSignOut = async () => {
    if (!canUseSupabase || !supabase) return;

    await supabase.auth.signOut();

    // Clear points and mastery on sign-out
    localStorage.removeItem('points');
    localStorage.removeItem('mastery');

    // Dispatch points change event
    window.dispatchEvent(new CustomEvent('points-changed', {
      detail: { points: 0 }
    }));
  };

  if (!canUseSupabase) return null;

  if (email) {
    return (
      <div className="flex items-center gap-2">
        <span 
          className="hidden sm:inline text-sm text-gray-700 max-w-[200px] md:max-w-[260px] whitespace-nowrap overflow-hidden text-ellipsis" 
          title={email}
        >
          User: {email}
        </span>
        <button 
          className="btn btn-ghost whitespace-nowrap" 
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </div>
    );
  }

  return showSignIn ? (
    <button 
      className="btn" 
      onClick={handleSignIn}
    >
      Sign in with GitHub
    </button>
  ) : null;
}
