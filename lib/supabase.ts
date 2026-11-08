import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local and restart the dev server.'
  );
}

/**
 * The one Supabase client for the app. The publishable key is safe in the browser:
 * the database's row-level security decides what each user can read and change.
 */
export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

/** A row of public.profiles. */
export interface ProfileRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  language: 'en' | 'bn';
  role: 'farmer' | 'admin';
  blocked: boolean;
  provider: string;
  last_sign_in_at: string | null;
  sign_in_count: number;
  created_at: string;
}

/** Where sign-in emails and Google should send people back to. */
export const redirectUrl = () => (typeof window === 'undefined' ? undefined : window.location.origin);
