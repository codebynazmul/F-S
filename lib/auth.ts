import type { Account, User } from './types';

/*
 * DEMO SIGN-IN ONLY.
 * This app has no server, so accounts, passwords and the admin panel all live in this
 * browser and anyone with developer tools can change them. Replace with real
 * authentication (e.g. Supabase, Firebase Auth) before storing any real farmer data.
 */

/** The built-in admin signs in with this ID instead of an email. */
export const BUILTIN_ADMIN_ID = 'admin';
/** Used until the admin changes it in Admin → Security. */
export const DEFAULT_ADMIN_PASSWORD = 'admin';
export const MIN_PASSWORD_LENGTH = 6;

export const BUILTIN_ADMIN: User = {
  id: BUILTIN_ADMIN_ID,
  name: 'Administrator',
  email: BUILTIN_ADMIN_ID,
  phone: '—',
  initials: 'AD',
  role: 'admin',
};

export async function hashPassword(password: string): Promise<string> {
  // crypto.subtle only exists on https and localhost.
  if (typeof crypto === 'undefined' || !crypto.subtle) return `plain:${password}`;
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return 'sha256:' + Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function checkPassword(password: string, stored: string): Promise<boolean> {
  if (stored.startsWith('plain:')) return stored === `plain:${password}`;
  return (await hashPassword(password)) === stored;
}

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function initialsOf(text: string): string {
  const words = text.replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? 'FS').slice(0, 2);
  return letters.toUpperCase();
}

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/** Bangladeshi mobile number without +880, e.g. 1712345678. */
export const isValidBdMobile = (digits: string) => /^1[3-9]\d{8}$/.test(digits);

/** Turns "rahim.uddin@x.com" into "Rahim Uddin". */
export const nameFromEmail = (email: string) =>
  email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export function userFromAccount(a: Account): User {
  return { id: a.id, name: a.name, email: a.email, phone: a.phone, initials: initialsOf(a.name || a.email), role: a.role };
}
