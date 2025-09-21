'use client';

import { useState, useEffect } from 'react';
import { supabase, hasSupabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [canUseSupabase, setCanUseSupabase] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      setCanUseSupabase(hasSupabase && !!supabase);

      if (!hasSupabase || !supabase) return;

      const { data: { session } } = await supabase.auth.getSession();
      setIsSignedIn(!!session?.user);
    };

    checkSession();

    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsSignedIn(!!session?.user);
      });

      return () => {
        data.subscription.unsubscribe();
      };
    }

    return () => {};
  }, []);

  const handleDemoMode = () => {
    localStorage.setItem('demo-mode', 'true');
    window.dispatchEvent(new Event('demo-changed'));
    router.push('/topics');
  };

  const handleSignIn = async () => {
    if (!canUseSupabase || !supabase) return;

    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin }
    });
  };

  return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 sm:px-6">
      <section className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 sm:p-10 max-w-3xl w-full text-center space-y-8">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900">
          <span className="underline-dojo">Welcome to JS Sensei</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-800 leading-loose">
          Train your JavaScript fundamentals in our interactive dojo.<br />
          Level up from white belt to black belt with practice quizzes, flashcards,<br />
          and one on one tutelage from our AI Sensei!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isSignedIn ? (
            <Link href="/topics" className="btn btn-primary">
              Go to Topics
            </Link>
          ) : (
            <>
              <button
                onClick={handleDemoMode}
                className="btn btn-ghost"
              >
                Use Demo
              </button>
              {canUseSupabase && (
                <button
                  onClick={handleSignIn}
                  className="btn btn-primary"
                >
                  Sign in with GitHub
                </button>
              )}
            </>
          )}
        </div>
        
        {!isSignedIn && (
          <Link 
            href="/topics" 
            className="text-sm text-gray-600 underline hover:text-gray-900"
          >
            Explore topics without an account
          </Link>
        )}
      </section>
    </main>
  );
}
