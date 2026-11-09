'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { CROP_DATABASE } from '@/data/crops';
import { getCrop } from '@/lib/metrics';
import { useApp } from './AppProvider';

/* Simple drawn icons so each crop can be recognised without reading. */
const BG: Record<string, string> = {
  rice_boro: '#E0F2FE',
  rice_aman: '#DCFCE7',
  wheat: '#FEF3C7',
  lentil: '#FFEDD5',
  chickpea: '#FEF9C3',
  mustard: '#FEFCE8',
  maize: '#FEF9C3',
  mungbean: '#ECFCCB',
};

function Glyph({ id }: { id: string }) {
  switch (id) {
    case 'rice_boro':
    case 'rice_aman': {
      const stem = id === 'rice_boro' ? '#0369A1' : '#15803D';
      return (
        <>
          <path d="M11 28 C12 20 13 12 16 8 C19 6 22 9 23 15" fill="none" stroke={stem} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M11 28 C8 23 7 19 6 15" fill="none" stroke="#16A34A" strokeWidth="1.6" strokeLinecap="round" />
          {[[16.6, 8.2, -60], [19.3, 7.8, -10], [21.4, 9.9, 20], [22.6, 12.7, 10], [23.1, 16, 0], [14.6, 11.5, -30]].map(([x, y, r], i) => (
            <ellipse key={i} cx={x} cy={y} rx="1.4" ry="2.3" fill="#CA8A04" transform={`rotate(${r} ${x} ${y})`} />
          ))}
          {id === 'rice_boro' && <path d="M6 25 q1.5 -2.5 3 0 a1.5 1.5 0 0 1 -3 0z" fill="#157A80" />}
        </>
      );
    }
    case 'wheat':
      return (
        <>
          <path d="M16 29 V7" stroke="#92400E" strokeWidth="1.6" strokeLinecap="round" />
          <ellipse cx="16" cy="6" rx="1.6" ry="2.6" fill="#D97706" />
          {[9.5, 13.5, 17.5, 21.5].map(y => (
            <g key={y}>
              <ellipse cx="13.7" cy={y} rx="1.6" ry="2.7" fill="#D97706" transform={`rotate(-35 13.7 ${y})`} />
              <ellipse cx="18.3" cy={y} rx="1.6" ry="2.7" fill="#D97706" transform={`rotate(35 18.3 ${y})`} />
            </g>
          ))}
        </>
      );
    case 'lentil':
      return (
        <>
          {[[11, 20], [21, 21], [16, 12]].map(([x, y], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx="5" ry="3.6" fill="#EA580C" />
              <ellipse cx={x - 1.2} cy={y - 1.1} rx="1.8" ry="0.9" fill="#FDBA74" />
            </g>
          ))}
        </>
      );
    case 'chickpea':
      return (
        <>
          <circle cx="13" cy="18" r="6.5" fill="#D6A55B" />
          <path d="M13 11.5 q2 -2 3.5 -1" fill="none" stroke="#A16207" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="21.5" cy="13" r="4.5" fill="#E2B970" />
          <circle cx="11" cy="16" r="1.6" fill="#F3D9A4" />
        </>
      );
    case 'mustard':
      return (
        <>
          <path d="M16 29 V17" stroke="#15803D" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M16 24 q-4 -1 -5 -4 q4 0 5 4z" fill="#16A34A" />
          {[0, 90, 180, 270].map(r => (
            <ellipse key={r} cx="16" cy="8.5" rx="3" ry="4" fill="#EAB308" transform={`rotate(${r} 16 13)`} />
          ))}
          <circle cx="16" cy="13" r="2.2" fill="#A16207" />
        </>
      );
    case 'maize':
      return (
        <>
          <ellipse cx="16" cy="14" rx="5" ry="9" fill="#FACC15" />
          {[9, 12, 15, 18].map(y => <path key={y} d={`M11.6 ${y} H20.4`} stroke="#CA8A04" strokeWidth="0.8" />)}
          <path d="M16 5.5 V22.5" stroke="#CA8A04" strokeWidth="0.8" />
          <path d="M16 29 C11 26 9 20 10 14 C12 19 14 22 16 23z" fill="#16A34A" />
          <path d="M16 29 C21 26 23 20 22 14 C20 19 18 22 16 23z" fill="#22C55E" />
        </>
      );
    case 'mungbean':
      return (
        <>
          <path d="M6 22 C10 14 18 9 26 9 C24 15 16 22 6 22z" fill="#4D7C0F" />
          {[[11, 18.6], [15, 16], [19, 13.4], [22.6, 11.2]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.7" fill="#84CC16" />
          ))}
          <path d="M26 9 q2 -1 3 -3" fill="none" stroke="#4D7C0F" strokeWidth="1.4" strokeLinecap="round" />
        </>
      );
    default:
      return <circle cx="16" cy="16" r="6" fill="#16A34A" />;
  }
}

export function CropIcon({ id, size = 40, className = '' }: { id: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={`shrink-0 ${className}`} aria-hidden>
      <rect width="32" height="32" rx="9" fill={BG[id] ?? '#ECFDF5'} />
      <Glyph id={id} />
    </svg>
  );
}

/** Crop chooser that shows each crop with its icon, water need and season length. */
export function CropPicker({ value, onChange, label, id }: {
  value: string; onChange: (id: string) => void; label: string; id: string;
}) {
  const { t, lang, n } = useApp();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const crop = getCrop(value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative no-print">
      <button
        id={id}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${label}: ${lang === 'bn' ? crop.nameBn : crop.name}`}
        className="btn-popup min-h-tap w-full sm:w-auto flex items-center justify-between gap-2 px-3 py-2 rounded-xl border glass-subtle border-sky-500/25 text-sm font-medium text-sky-700 dark:text-sky-300"
      >
        <span>{t('Change', 'পরিবর্তন')}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="group"
          aria-label={label}
          className="card-popup absolute z-30 mt-2 inset-x-0 sm:left-auto sm:w-[22rem] p-2 rounded-2xl glass-strong grid grid-cols-1 gap-1 max-h-[60vh] overflow-y-auto"
        >
          {Object.values(CROP_DATABASE).map(c => {
            const active = c.id === value;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => { onChange(c.id); setOpen(false); }}
                className={`min-h-tap flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${
                  active ? 'bg-sky-500/15 ring-1 ring-sky-500/40' : 'hover:bg-sky-500/10'
                }`}
              >
                <CropIcon id={c.id} size={36} />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-slate-900 dark:text-slate-50 truncate">{lang === 'bn' ? c.nameBn : c.name}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {t('Water', 'পানি')} {n(c.waterMm)} {t('mm', 'মিমি')} · {n(c.growingPeriodDays)} {t('days', 'দিন')}
                  </span>
                </span>
                {active && <Check className="h-4 w-4 text-sky-600 dark:text-sky-300 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
