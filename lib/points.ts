// lib/points.ts

export type Belt =
  | 'White'
  | 'Yellow'
  | 'Orange'
  | 'Green'
  | 'Blue'
  | 'Purple'
  | 'Brown'
  | 'Red'
  | 'Black';

export function beltFor(points: number): Belt {
  if (points >= 500) return 'Black';
  if (points >= 350) return 'Red';
  if (points >= 250) return 'Brown';
  if (points >= 180) return 'Purple';
  if (points >= 130) return 'Blue';
  if (points >= 90) return 'Green';
  if (points >= 60) return 'Orange';
  if (points >= 30) return 'Yellow';
  return 'White';
}

export function getPoints(): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem('points');
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

type SupabaseClient = {
  auth: {
    getUser: () => Promise<{ data: { user: { id: string } | null } }>;
    signOut: () => Promise<void>;
  };
  from: (table: string) => {
    upsert: (data: { id: string; points: number }, options: { onConflict: string }) => Promise<{ error?: Error }>;
    select: (columns: '*' | string | string[]) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: { points?: number } | null; error?: Error }>;
      }
    }
  }
};

async function syncPointsToSupabase(points: number): Promise<void> {
  try {
    const { supabase, hasSupabase } = await import('./supabaseClient').catch(() => ({
      supabase: null as SupabaseClient | null,
      hasSupabase: false,
    }));
    if (!hasSupabase || !supabase) return;

    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) return;

    await supabase
      .from('profiles')
      .upsert({ id: user.id, points }, { onConflict: 'id' });
  } catch {
    // no-op
  }
}

export async function addPoints(n: number): Promise<number> {
  const curr = getPoints();
  const next = Math.max(0, curr + n);

  if (typeof window !== 'undefined') {
    localStorage.setItem('points', String(next));
    window.dispatchEvent(
      new CustomEvent('points-changed', { detail: { points: next } })
    );
  }

  await syncPointsToSupabase(next);
  return next;
}

export async function loadPointsFromSupabase(): Promise<number | null> {
  try {
    const { supabase, hasSupabase } = await import('./supabaseClient').catch(() => ({
      supabase: null as SupabaseClient | null,
      hasSupabase: false,
    }));
    if (!hasSupabase || !supabase) return null;

    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', user.id)
      .maybeSingle();

    let pts = 0;

    if (error || !data) {
      await supabase
        .from('profiles')
        .upsert({ id: user.id, points: 0 }, { onConflict: 'id' });
      pts = 0;
    } else {
      pts = Number(data.points ?? 0);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('points', String(pts));
      window.dispatchEvent(
        new CustomEvent('points-changed', { detail: { points: pts } })
      );
    }

    return pts;
  } catch {
    return null;
  }
}
