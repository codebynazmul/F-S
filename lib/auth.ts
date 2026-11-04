import type { User } from './types';

/*
 * DEMO SIGN-IN ONLY.
 * This app has no server, so every check here runs in the browser and can be bypassed.
 * Replace with real authentication (e.g. NextAuth, Firebase Auth, Supabase) before
 * storing any real farmer data.
 */

export const DEMO_ADMIN_EMAIL = 'spiderx@gmail.com';
// SHA-256 of the demo admin password, so the password itself is not in the source.
const ADMIN_PASSWORD_SHA256 = '1ae8a1546ab27665d7f2a286689a125226b78de68d62272fd6e6218a7495f056';

async function sha256(text: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function isAdminLogin(email: string, password: string): Promise<boolean> {
  if (email.trim().toLowerCase() !== DEMO_ADMIN_EMAIL) return false;
  if (typeof crypto === 'undefined' || !crypto.subtle) return false;
  return (await sha256(password)) === ADMIN_PASSWORD_SHA256;
}

export function initialsOf(text: string): string {
  const words = text.replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? 'FS').slice(0, 2);
  return letters.toUpperCase();
}

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/** Bangladeshi mobile number without +880, e.g. 1712345678. */
export const isValidBdMobile = (digits: string) => /^1[3-9]\d{8}$/.test(digits);

export function makeUser(partial: Omit<User, 'initials'> & { initials?: string }): User {
  return { ...partial, initials: partial.initials ?? initialsOf(partial.name || partial.email) };
}
