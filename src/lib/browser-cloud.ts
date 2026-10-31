'use client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
let instance: SupabaseClient | null = null;
export function browserCloud() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  try { if (!['http:','https:'].includes(new URL(url).protocol)) return null; } catch { return null; }
  if (!instance) instance = createClient(url, key, { auth: { flowType: 'pkce', detectSessionInUrl: false, persistSession: true, autoRefreshToken: true } });
  return instance;
}
