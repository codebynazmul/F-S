'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { EASE_ENTER } from '@/lib/motion';
import { useApp } from './AppProvider';

export const primaryBtn = 'btn-popup fs-btn-primary min-h-tap font-medium';
export const harvestBtn = 'btn-popup fs-btn-harvest min-h-tap';
export const ghostBtn =
  'btn-popup min-h-tap px-4 py-2 rounded-full border border-sky-600/25 bg-[var(--bg-surface)] hover:bg-sky-600/[0.07] hover:border-sky-600/45 text-sm font-semibold flex items-center justify-center gap-1.5 w-fit text-sky-700 dark:text-sky-300 cursor-pointer';
export const inputClass =
  'fs-field w-full min-h-[48px] text-[0.9375rem] font-medium px-3.5 py-2.5 rounded-2xl outline-none text-slate-800 dark:text-slate-100';
export const labelClass = 'text-sm font-semibold block mb-1.5 text-slate-700 dark:text-slate-300';
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

/** Rows of young crops under a rising sun, drawn in the corner of every tab banner. */
function FieldArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 150" fill="none" className={className} aria-hidden>
      <circle cx="196" cy="58" r="30" fill="rgb(var(--gold))" opacity="0.9" />
      <path d="M0 150 C 60 96, 160 92, 260 112 L260 150 Z" fill="currentColor" opacity="0.55" />
      <path d="M0 150 C 80 118, 180 116, 260 132 L260 150 Z" fill="currentColor" />
      {[24, 58, 92, 126, 160, 194, 228].map((x, i) => (
        <g key={x} transform={`translate(${x} ${118 - (i % 2) * 4})`} stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M0 18 V2" />
          <path d="M0 8 C -8 6, -11 0, -11 -4 C -4 -3, 0 2, 0 8" fill="currentColor" />
          <path d="M0 5 C 8 3, 11 -3, 11 -7 C 4 -6, 0 -1, 0 5" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

/** Tab heading: a soft field banner with a big icon tile, the title, a description and actions. */
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
    <div className="fs-hero px-5 py-5 sm:px-7 sm:py-7 flex flex-col md:flex-row md:items-end justify-between gap-5">
      <FieldArt className="fs-hero-art" />
      <div className="min-w-0 max-w-3xl flex items-start gap-4">
        <span className="fs-icon-tile h-14 w-14 sm:h-16 sm:w-16 rounded-2xl">
          <Icon className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
        </span>
        <div className="min-w-0">
          {badge && <p className="fs-eyebrow">{badge}</p>}
          <h2 className={`fs-display text-[1.625rem] sm:text-[2rem] lg:text-[2.375rem] ${titleText} ${badge ? 'mt-1' : ''}`}>
            {title}
          </h2>
          {description && <p className="text-[0.9375rem] sm:text-base mt-2 leading-relaxed text-slate-700 dark:text-slate-300 max-w-2xl">{description}</p>}
        </div>
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
    `btn-popup ${pad} min-h-[40px] rounded-full text-sm font-semibold cursor-pointer ${
      active ? 'fs-btn-primary' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-sky-600/[0.07]'
    }`;
  return (
    <div className="flex items-center gap-0.5 p-1 rounded-full border border-sky-600/20 bg-[var(--bg-surface)] w-fit" role="group" aria-label="Language">
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
      className="h-2.5 rounded-full overflow-hidden bg-slate-500/15"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label={label}
    >
      {/* Grows from zero when shown, then eases to each new value. scaleX keeps it on the GPU. */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: Math.max(0, Math.min(100, value)) / 100 }}
        transition={{ duration: 0.6, ease: EASE_ENTER }}
        style={{ originX: 0 }}
        className={`h-full w-full rounded-full ${color}`}
      />
    </div>
  );
}

export function Avatar({ initials, admin = false, size = 'sm' }: { initials: string; admin?: boolean; size?: 'sm' | 'lg' }) {
  const dims = size === 'lg' ? 'text-3xl w-20 h-20 rounded-3xl' : 'text-sm w-10 h-10 rounded-2xl';
  return (
    <span
      className={`${dims} font-display font-bold flex items-center justify-center shrink-0 ${
        admin ? 'bg-amber-100 text-amber-900' : 'fs-icon-tile'
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
