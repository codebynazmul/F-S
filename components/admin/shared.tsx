'use client';

import React from 'react';
import { Info, type LucideIcon } from 'lucide-react';
import { ALL_DISTRICTS } from '@/data/districts';
import type { Account, AdminAction, Lang } from '@/lib/types';
import { useApp } from '../AppProvider';

export const DAY_MS = 24 * 60 * 60 * 1000;

const locale = (lang: Lang) => (lang === 'bn' ? 'bn-BD' : 'en-GB');

export const formatTime = (ms: number, lang: Lang) =>
  new Date(ms).toLocaleString(locale(lang), { dateStyle: 'medium', timeStyle: 'short' });

export const formatDate = (ms: number, lang: Lang) =>
  new Date(ms).toLocaleDateString(locale(lang), { dateStyle: 'medium' });

export const formatClock = (ms: number, lang: Lang) =>
  new Date(ms).toLocaleTimeString(locale(lang), { timeStyle: 'short' });

/** "5 minutes ago", "yesterday", or a date once it is over a week old. */
export function relativeTime(ms: number, lang: Lang) {
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale(lang), { numeric: 'auto' });
  if (abs < 60_000) return rtf.format(0, 'second');
  if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), 'minute');
  if (abs < DAY_MS) return rtf.format(Math.round(diff / 3_600_000), 'hour');
  if (abs < 7 * DAY_MS) return rtf.format(Math.round(diff / DAY_MS), 'day');
  return formatDate(ms, lang);
}

export const districtOf = (a: Account) => ALL_DISTRICTS.find(d => d.id === a.districtId);

/** How a person can be recognised: email, or phone for phone sign-ins. */
export const contactOf = (a: Account) => (a.email !== '—' ? a.email : a.phone);

export const METHOD_LABEL: Record<Account['method'], [string, string]> = {
  email: ['Email', 'ইমেইল'],
  phone: ['Phone code', 'ফোন কোড'],
  google: ['Google', 'গুগল'],
  apple: ['Apple', 'অ্যাপল'],
};

export const ACTION_LABEL: Record<AdminAction, [string, string]> = {
  login: ['Signed in', 'সাইন ইন'],
  login_failed: ['Failed sign-in attempt', 'ব্যর্থ সাইন-ইন চেষ্টা'],
  logout: ['Signed out', 'সাইন আউট'],
  edit_user: ['Edited user', 'ব্যবহারকারীর তথ্য সম্পাদনা'],
  block_user: ['Blocked user', 'ব্যবহারকারী ব্লক'],
  unblock_user: ['Unblocked user', 'ব্লক তুলে নেওয়া'],
  delete_user: ['Deleted user', 'ব্যবহারকারী মুছে ফেলা'],
  make_admin: ['Made admin', 'অ্যাডমিন করা হয়েছে'],
  remove_admin: ['Removed admin role', 'অ্যাডমিন পদ সরানো'],
  change_password: ['Changed password', 'পাসওয়ার্ড পরিবর্তন'],
  export_users: ['Exported user list', 'ব্যবহারকারী তালিকা ডাউনলোড'],
  clear_log: ['Cleared activity log', 'কার্যক্রম লগ মুছে ফেলা'],
};

/** Saves rows as a CSV file. */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const cell = (v: string | number) => {
    const text = String(v);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  // The BOM makes Excel open Bangla text correctly.
  const csv = '﻿' + rows.map(r => r.map(cell).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* One look for the whole admin panel. Colours come from the app's     */
/* day/night tokens in globals.css, so both themes stay in step.       */
/* ------------------------------------------------------------------ */

/** The one card style inside the admin panel. */
export const panel = 'rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-surface-2)]';

/** A card you can click: lifts 2px and darkens its edge. */
export const liftable =
  'transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[0_10px_24px_var(--shadow-color)] motion-reduce:transform-none';

/** Focus ring shared by every control. */
export const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)]';

const btnBase =
  `inline-flex items-center justify-center gap-1.5 min-h-tap min-w-tap px-3.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none motion-reduce:transform-none ${focusRing}`;

/** Main action: filled with the app's sky accent. */
export const btnPrimary = `${btnBase} bg-sky-600 text-white hover:bg-sky-700 shadow-sm`;
/** Everyday action: outlined on the card surface. */
export const btnQuiet = `${btnBase} border border-[var(--border-soft)] bg-[var(--bg-surface)] text-slate-700 dark:text-slate-300 hover:border-[var(--border-strong)] hover:text-slate-900 dark:hover:text-white`;
/** Destructive action: outlined, red text, fills red on hover. */
export const btnDanger = `${btnBase} border border-red-500/30 bg-[var(--bg-surface)] text-red-600 dark:text-red-400 hover:bg-red-600 hover:border-red-600 hover:!text-white`;

export const fieldClass =
  `w-full min-h-tap text-sm px-3 py-2.5 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)] text-slate-900 dark:text-slate-50 placeholder:text-slate-500 transition-colors hover:border-[var(--border-strong)] ${focusRing} focus-visible:border-sky-500`;

export const eyebrow = 'text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400';

/** Small round initials badge. Admins get the ink tone, farmers the sky tone. */
export function AdminAvatar({ name, admin = false }: { name: string; admin?: boolean }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?';
  return (
    <span
      aria-hidden
      className={`h-10 w-10 shrink-0 rounded-full grid place-items-center text-sm font-semibold ${
        admin ? 'bg-[var(--text-primary)] text-[var(--bg-surface)]' : 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
      }`}
    >
      {initials}
    </span>
  );
}

/** Small pill for a role or status. */
export function Pill({ tone, icon: Icon, children }: { tone: 'ink' | 'red' | 'muted'; icon?: LucideIcon; children: React.ReactNode }) {
  const look = {
    ink: 'bg-[var(--text-primary)] text-[var(--bg-surface)] border-transparent',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    muted: 'bg-transparent text-slate-500 border-[var(--border-soft)]',
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold leading-5 ${look}`}>
      {Icon && <Icon className="h-3 w-3" aria-hidden />}
      {children}
    </span>
  );
}

/** Heading for a block inside a section, with an optional note on the right. */
export function BlockHead({ title, meta }: { title: string; meta?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
      {meta && <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">{meta}</span>}
    </div>
  );
}

/** Quiet note at the foot of a section. */
export function FootNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
      <Info className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

const TONES = {
  sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  red: 'bg-red-500/10 text-red-600 dark:text-red-400',
  ink: 'bg-[var(--text-primary)] text-[var(--bg-surface)]',
} as const;

/** A single headline number. With onClick it becomes a shortcut into the user list. */
export function StatTile({ icon: Icon, label, value, note, tone = 'sky', onClick, actionLabel }: {
  icon: LucideIcon;
  label: string;
  value: string;
  note?: string;
  tone?: keyof typeof TONES;
  onClick?: () => void;
  actionLabel?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
        <span className={`h-8 w-8 rounded-lg grid place-items-center ${TONES[tone]}`}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-slate-50">{value}</div>
      {note && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{note}</div>}
    </>
  );
  if (!onClick) return <div className={`${panel} p-4`}>{body}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={actionLabel ? `${label}: ${value}. ${actionLabel}` : undefined}
      className={`${panel} ${liftable} ${focusRing} p-4 text-left w-full`}
    >
      {body}
    </button>
  );
}

/** Ranked horizontal bars for one measure, each with its count and share. */
export function BarList({ title, items, empty }: {
  title: string;
  items: { label: string; value: number }[];
  empty: string;
}) {
  const { n } = useApp();
  const max = Math.max(1, ...items.map(i => i.value));
  const total = items.reduce((sum, i) => sum + i.value, 0);
  return (
    <section className={`${panel} p-5 space-y-4`}>
      <BlockHead title={title} />
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{empty}</p>
      ) : (
        <ol className="space-y-3">
          {items.map((item, i) => (
            <li key={item.label} className="space-y-1.5" title={`${item.label}: ${item.value}`}>
              <div className="flex items-baseline gap-3 text-sm">
                <span className="w-5 shrink-0 text-xs tabular-nums text-slate-500">{n(i + 1)}</span>
                <span className="flex-1 truncate text-slate-700 dark:text-slate-300">{item.label}</span>
                <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">{n(Math.round((item.value / Math.max(1, total)) * 100))}%</span>
                <span className="w-8 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-50">{n(item.value)}</span>
              </div>
              <div className="ml-8 h-1.5 rounded-full bg-slate-400/15 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${i === 0 ? 'bg-sky-600 dark:bg-sky-400' : 'bg-sky-500/55'}`}
                  style={{ width: `${(item.value / max) * 100}%`, minWidth: item.value > 0 ? 4 : 0 }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
