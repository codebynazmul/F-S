'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from './AppProvider';

export const primaryBtn = 'btn-popup fs-btn-primary min-h-tap font-medium';
export const ghostBtn =
  'btn-popup min-h-tap px-3.5 py-2 rounded-xl border border-sky-600/20 bg-transparent hover:bg-sky-600/5 hover:border-sky-600/40 text-sm font-medium flex items-center justify-center gap-1.5 w-fit text-sky-700 dark:text-sky-300';
export const inputClass =
  'fs-field w-full min-h-tap text-sm font-medium px-3 py-2.5 rounded-xl outline-none text-slate-800 dark:text-slate-100';
export const labelClass = 'text-sm font-medium block mb-1.5 text-slate-700 dark:text-slate-300';
export const mutedText = 'text-slate-600 dark:text-slate-400';
export const titleText = 'text-slate-900 dark:text-slate-50';

/** Main card: flat surface, hairline border. */
export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  const { isNight } = useApp();
  return <div className={`${isNight ? 'glass-strong' : 'glass'} ${className}`}>{children}</div>;
}

/** Lighter box nested inside a Card. */
export function SubCard({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`glass-subtle ${className}`}>{children}</div>;
}

/** Tab heading: a small label, a large title, an optional description and actions on the right. */
export function TabHeader({
  icon: Icon, title, badge, description, actions,
}: {
  icon: LucideIcon;
  title: string;
  badge?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Kept for older callers; every tab now uses the one accent. */
  accent?: 'sky' | 'violet';
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-sky-600/10 gap-5">
      <div className="min-w-0 max-w-3xl">
        {badge && (
          <p className="fs-eyebrow flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
            {badge}
          </p>
        )}
        <h2 className={`fs-display text-[1.75rem] lg:text-[2.25rem] ${titleText} mt-2 flex items-center gap-2.5`}>
          {!badge && <Icon className="h-7 w-7 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />}
          <span>{title}</span>
        </h2>
        {description && <p className="text-[0.9375rem] mt-3 leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 no-print shrink-0">{actions}</div>}
    </div>
  );
}

/** Two-button English / Bangla switch. */
export function LangToggle({ size = 'sm', full = false }: { size?: 'sm' | 'md'; full?: boolean }) {
  const { lang, setLang } = useApp();
  const pad = size === 'md' ? 'px-4' : 'px-3';
  const btn = (active: boolean) =>
    `btn-popup ${pad} min-h-[40px] rounded-lg text-sm font-medium ${
      active ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
    }`;
  return (
    <div className="flex items-center p-1 rounded-xl border border-sky-600/15 bg-[var(--bg-surface)] w-fit" role="group" aria-label="Language">
      <button type="button" onClick={() => setLang('bn')} className={btn(lang === 'bn')} aria-pressed={lang === 'bn'}>বাংলা</button>
      <button type="button" onClick={() => setLang('en')} className={btn(lang === 'en')} aria-pressed={lang === 'en'}>
        {full ? 'English' : 'EN'}
      </button>
    </div>
  );
}

/** Horizontal 0–100 bar. */
export function Meter({ value, color = 'bg-sky-500', label }: { value: number; color?: string; label?: string }) {
  return (
    <div
      className="h-2 rounded-full overflow-hidden bg-slate-500/15"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label={label}
    >
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%` }} className={`h-full rounded-full ${color} transition-all duration-500`} />
    </div>
  );
}

export function Avatar({ initials, admin = false, size = 'sm' }: { initials: string; admin?: boolean; size?: 'sm' | 'lg' }) {
  const dims = size === 'lg' ? 'text-3xl w-20 h-20 rounded-2xl' : 'text-sm w-9 h-9 rounded-xl';
  return (
    <span
      className={`${dims} font-medium flex items-center justify-center shrink-0 ${
        admin ? 'bg-amber-100 text-amber-900' : 'bg-sky-600 text-white'
      }`}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/** Grey shimmering block shown while content loads. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}
