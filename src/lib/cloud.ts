import { createClient } from '@supabase/supabase-js';
export function cloudConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  return { url, key, ready: /^https?:\/\//.test(url) && !!key };
}
export function serverCloud(token?: string) {
  const { url, key, ready } = cloudConfig();
  if (!ready) throw new Error('CLOUD_NOT_CONFIGURED');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { headers: token ? { Authorization: `Bearer ${token}` } : {}, fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) } });
}
