export type Belt =
  | 'White' | 'Yellow' | 'Orange' | 'Green' | 'Blue' | 'Purple' | 'Brown' | 'Red' | 'Black';

export function beltFor(points: number): Belt {
  if (points >= 500) return 'Black';
  if (points >= 350) return 'Red';
  if (points >= 250) return 'Brown';
  if (points >= 180) return 'Purple';
  if (points >= 130) return 'Blue';
  if (points >= 90)  return 'Green';
  if (points >= 60)  return 'Orange';
  if (points >= 30)  return 'Yellow';
  return 'White';
}

export function getPoints(): number {
  const raw = typeof window !== 'undefined' ? localStorage.getItem('points') : null;
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

async function syncSupabase(points: number) {
  const { supabase } = await import('@/lib/supabaseClient').catch(() => ({ supabase: null }));
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('profiles').upsert({ id: user.id, points }, { onConflict: 'id' });
}

export async function addPoints(n: number): Promise<number> {
  const next = Math.max(0, getPoints() + n);
  if (typeof window !== 'undefined') {
    localStorage.setItem('points', String(next));
    window.dispatchEvent(new CustomEvent('points-changed', { detail: { points: next } }));
  }
  await syncSupabase(next);
  return next;
}

export async function loadPointsFromSupabase(): Promise<number | null> {
  try {
    const { supabase } = await import('@/lib/supabaseClient').catch(() => ({ supabase: null }));
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch points, upsert if no row exists
    let { data, error } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', user.id)
      .single();

    // If no row exists, upsert with 0 points
    if (error) {
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, points: 0 }, { onConflict: 'id' });
      
      if (upsertError) return null;
      
      // After upsert, set points to 0
      data = { points: 0 };
    }

    const pts = Number(data?.points ?? 0);
    
    // Always mirror to localStorage and dispatch event
    if (typeof window !== 'undefined') {
      localStorage.setItem('points', String(pts));
      window.dispatchEvent(new CustomEvent('points-changed', { 
        detail: { points: pts } 
      }));
    }
    
    return pts;
  } catch {
    return null;
  }
}
