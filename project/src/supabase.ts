import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseConfig(): { url: string; key: string } {
  const envUrl = import.meta.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL ?? '';
  const envKey = import.meta.env.SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

  if (envUrl && envKey && envUrl !== 'https://your-project-id.supabase.co' && !envUrl.includes('your-project-id')) {
    return { url: envUrl, key: envKey };
  }

  try {
    const lsUrl = localStorage.getItem('akshat_supabase_url');
    const lsKey = localStorage.getItem('akshat_supabase_key');
    if (lsUrl && lsKey) {
      return { url: lsUrl, key: lsKey };
    }
  } catch {
    // ignore
  }

  return { url: '', key: '' };
}

const initialConfig = getSupabaseConfig();
export let isSupabaseConfigured = Boolean(initialConfig.url && initialConfig.key);
export let supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(initialConfig.url, initialConfig.key)
  : null;

export function configureSupabase(url: string, key: string): boolean {
  try {
    if (!url || !key) {
      localStorage.removeItem('akshat_supabase_url');
      localStorage.removeItem('akshat_supabase_key');
      isSupabaseConfigured = false;
      supabase = null;
      return false;
    }
    localStorage.setItem('akshat_supabase_url', url.trim());
    localStorage.setItem('akshat_supabase_key', key.trim());
    isSupabaseConfigured = true;
    supabase = createClient(url.trim(), key.trim());
    return true;
  } catch {
    return false;
  }
}
