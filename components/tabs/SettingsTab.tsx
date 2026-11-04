'use client';

import React from 'react';
import { CheckCircle2, Moon, SlidersHorizontal, Sun, Trash2 } from 'lucide-react';
import { clearSavedData } from '@/lib/storage';
import { useApp } from '../AppProvider';
import { Card, LangToggle, TabHeader, labelClass } from '../ui';

export default function SettingsTab() {
  const { t, theme, setTheme } = useApp();

  const resetAll = () => {
    if (!window.confirm(t('Delete all saved data on this device (profile, farm, plans, alerts) and sign out?',
                          'এই ডিভাইসে সংরক্ষিত সব তথ্য (প্রোফাইল, খামার, পরিকল্পনা, সতর্কতা) মুছে লগআউট করবেন?'))) return;
    clearSavedData();
    window.location.reload();
  };

  return (
    <div className="space-y-6 card-rise">
      <Card className="rounded-4xl p-6 lg:p-8 shadow-xl space-y-6">
        <TabHeader
          icon={SlidersHorizontal}
          badge={t('Settings & Preferences', 'সেটিংস ও পছন্দ')}
          title={t('Theme & Language', 'থিম ও ভাষা পছন্দ')}
          description={t('Day mode uses a light sky-blue and white theme. Night mode switches to deep dark gray, which is easier on the eyes at night.',
                         'দিনের মুডে আকাশি নীল ও সাদা থিম থাকে; রাতের মুডে গাঢ় ধূসর থিম চালু হয়, যা রাতে চোখের জন্য আরামদায়ক।')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ThemeCard
            active={theme === 'day'} onClick={() => setTheme('day')}
            icon={<Sun className="h-4 w-4 text-amber-500" />}
            title={t('Day Mode', 'দিন মুড')} subtitle={t('Light Sky Blue + White', 'আকাশি নীল + সাদা')}
            swatches={['#F0F9FF', '#7DD3FC', '#0284C7', '#FFFFFF']}
            style={{ background: 'linear-gradient(135deg, #F0F9FF 0%, #FFFFFF 100%)', color: '#0F172A' }}
          />
          <ThemeCard
            active={theme === 'night'} onClick={() => setTheme('night')}
            icon={<Moon className="h-4 w-4 text-amber-300" />}
            title={t('Night Mode', 'রাত মুড')} subtitle={t('Deep Dark Gray', 'গাঢ় ধূসর থিম')}
            swatches={['#161819', '#1F2937', '#38BDF8', '#0B0F14']}
            style={{ background: 'linear-gradient(135deg, #161819 0%, #1F2937 100%)', color: '#F1F5F9' }}
          />
        </div>

        <div>
          <span className={labelClass}>{t('Language', 'ভাষা')}</span>
          <LangToggle size="md" full />
        </div>

        <div className="pt-4 border-t border-sky-500/10 space-y-2">
          <span className={labelClass}>{t('Saved data', 'সংরক্ষিত তথ্য')}</span>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('Your preferences, farm profile and plans are stored only in this browser.',
               'আপনার পছন্দ, খামারের তথ্য ও পরিকল্পনা শুধু এই ব্রাউজারে সংরক্ষিত থাকে।')}
          </p>
          <button type="button" onClick={resetAll} className="btn-popup min-h-tap text-sm font-bold flex items-center gap-1.5 text-red-600 dark:text-red-400 px-4 rounded-xl border border-red-500/30">
            <Trash2 className="h-4 w-4" />{t('Clear all saved data', 'সব সংরক্ষিত তথ্য মুছুন')}
          </button>
        </div>
      </Card>
    </div>
  );
}

function ThemeCard({ active, onClick, icon, title, subtitle, swatches, style }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; title: string; subtitle: string;
  swatches: string[]; style: React.CSSProperties;
}) {
  // Inline color keeps the preview readable regardless of the current theme.
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`btn-popup p-5 rounded-2xl border text-left ${active ? 'border-sky-500 ring-2 ring-sky-500/30 shadow-md' : 'border-sky-500/15 hover:border-sky-500/40'}`}
      style={style}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-black flex items-center gap-2" style={{ color: style.color }}>{icon}{title}</span>
        {active && <CheckCircle2 className="h-5 w-5 text-sky-500" />}
      </div>
      <p className="text-xs opacity-80" style={{ color: style.color }}>{subtitle}</p>
      <div className="mt-3 flex gap-1.5">
        {swatches.map(c => <span key={c} className="h-3 w-3 rounded-full border border-black/10" style={{ background: c }} />)}
      </div>
    </button>
  );
}
