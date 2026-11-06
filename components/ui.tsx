'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from './AppProvider';

export const primaryBtn = 'btn-popup min-h-tap bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md';
export const ghostBtn =
  'btn-popup min-h-tap px-3.5 py-2 rounded-xl border border-sky-500/15 glass-subtle text-xs font-bold flex items-center justify-center gap-1.5 w-fit text-sky-600 dark:text-sky-300';
export const inputClass =
  'w-full min-h-tap text-sm font-bold px-3 py-2.5 rounded-xl glass-subtle border border-sky-500/15 outline-none text-slate-800 dark:text-slate-100';
export const labelClass = 'text-sm font-bold block mb-1.5 text-slate-700 dark:text-slate-300';
export const mutedText = 'text-slate-600 dark:text-slate-400';
export const titleText = 'text-slate-900 dark:text-slate-50';

/** Main frosted card. */
export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  const { isNight } = useApp();
  return <div className={`${isNight ? 'glass-strong' : 'glass'} ${className}`}>{children}</div>;
}

/** Lighter card nested inside a Card. */
export function SubCard({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`glass-subtle ${className}`}>{children}</div>;
}

/** Big tab heading with icon, optional badge, description and right-side actions. */
export function TabHeader({
  icon: Icon, title, badge, description, actions, accent = 'sky',
}: {
  icon: LucideIcon;
  title: string;
  badge?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  accent?: 'sky' | 'violet';
}) {
  const color = accent === 'violet' ? 'text-violet-500' : 'text-sky-500';
  const badgeColor =
    accent === 'violet'
      ? 'bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/25'
      : 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25';
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-sky-500/15 gap-4">
      <div>
        {badge && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${badgeColor}`}>{badge}</span>
        )}
        <h2 className={`text-lg lg:text-xl font-black ${titleText} mt-1 flex items-center gap-2`}>
          <Icon className={`h-6 w-6 shrink-0 ${color}`} />
          <span>{title}</span>
        </h2>
        {description && <p className="text-sm mt-1 leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 no-print">{actions}</div>}
    </div>
  );
}

/** Two-button English / Bangla switch. */
export function LangToggle({ size = 'sm', full = false }: { size?: 'sm' | 'md'; full?: boolean }) {
  const { lang, setLang } = useApp();
  const pad = size === 'md' ? 'px-4' : 'px-3';
  const btn = (active: boolean) =>
    `btn-popup ${pad} min-h-[40px] rounded-lg text-sm font-bold ${
      active ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
    }`;
  return (
    <div className="flex items-center p-1 rounded-xl border border-sky-500/20 glass-subtle w-fit" role="group" aria-label="Language">
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
      className="h-2.5 rounded-full overflow-hidden bg-slate-400/15"
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
  const dims = size === 'lg' ? 'text-4xl w-20 h-20 rounded-3xl shadow-lg' : 'text-sm w-9 h-9 rounded-xl';
  return (
    <span
      className={`${dims} font-black flex items-center justify-center shrink-0 text-white`}
      style={{
        background: admin
          ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'
          : 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
      }}
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
