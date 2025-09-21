'use client';
import { useEffect, useState } from 'react';
import { supabase, hasSupabase } from '@/lib/supabaseClient';
import { addPoints } from '@/lib/points';

interface AuthButtonsProps {
  showSignIn?: boolean;
}

export default function AuthButtons({ showSignIn = true }: AuthButtonsProps) {
  if (!hasSupabase || !supabase) return null;
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadUserPoints = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', userId)
          .single();

        if (data?.points !== undefined && !error) {
          localStorage.setItem('points', String(data.points));
          window.dispatchEvent(new CustomEvent('points-changed', { 
            detail: { points: data.points } 
          }));
        }
      } catch {}
    };

    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      setEmail(user?.email ?? null);

      // Load points if user exists
      if (user) {
        await loadUserPoints(user.id);
      }
    };
    checkUser();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const user = session?.user;
      setEmail(user?.email ?? null);

      // Load points on first sign-in
      if (user) {
        await loadUserPoints(user.id);
      }
    });

    return () => sub?.subscription?.unsubscribe();
  }, []);

  return email ? (
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
          await supabase!.auth.signOut(); 
          
          // Clear points and mastery on sign-out
          localStorage.removeItem('points');
          localStorage.removeItem('mastery');
          
          // Dispatch points change event
          window.dispatchEvent(new CustomEvent('points-changed', { 
            detail: { points: 0 } 
          }));
        }}
      >
        Sign out
      </button>
    </div>
  ) : (
    showSignIn ? (
      <button
        className="btn"
        onClick={() =>
          supabase!.auth.signInWithOAuth({
            provider: 'github',
            options: { redirectTo: window.location.origin },
          })
        }
      >
        Sign in with GitHub
      </button>
    ) : null
  );
}
