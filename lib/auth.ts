import type { Account, SignInMethod, User } from './types';
import type { ProfileRow } from './supabase';

/** Supabase's default minimum password length. */
export const MIN_PASSWORD_LENGTH = 6;

export function initialsOf(text: string): string {
  const words = text.replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? 'FS').slice(0, 2);
  return letters.toUpperCase();
}

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/** Turns "rahim.uddin@x.com" into "Rahim Uddin". */
export const nameFromEmail = (email: string) =>
  email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const methodOf = (provider: string): SignInMethod =>
  provider === 'google' || provider === 'apple' || provider === 'phone' ? provider : 'email';

export function userFromProfile(p: ProfileRow): User {
  const name = p.name || nameFromEmail(p.email ?? '');
  return {
    id: p.id,
    name,
    email: p.email ?? '—',
    phone: p.phone || '—',
    initials: initialsOf(name || p.email || ''),
    role: p.role,
  };
}

export function accountFromProfile(p: ProfileRow, farm?: Pick<Account, 'districtId' | 'farm'>): Account {
  const created = Date.parse(p.created_at);
  return {
    id: p.id,
    name: p.name || nameFromEmail(p.email ?? ''),
    email: p.email ?? '—',
    phone: p.phone || '—',
    method: methodOf(p.provider),
    role: p.role,
    blocked: p.blocked,
    createdAt: created,
    lastLoginAt: p.last_sign_in_at ? Date.parse(p.last_sign_in_at) : created,
    loginCount: p.sign_in_count,
    ...farm,
  };
}
