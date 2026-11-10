'use client';

import React from 'react';
import { CheckCircle2, Moon, SlidersHorizontal, Sun, Trash2 } from 'lucide-react';
import { clearSavedData } from '@/lib/storage';
import { useApp } from '../AppProvider';
import { Card, LangToggle, TabHeader, labelClass } from '../ui';

export default function SettingsTab() {
  const { t, theme, setTheme, signOut } = useApp();

  const resetAll = async () => {
    if (!window.confirm(t('Delete all saved data on this device (profile, farm, plans) and sign out?',
                          'এই ডিভাইসে সংরক্ষিত সব তথ্য (প্রোফাইল, খামার, পরিকল্পনা) মুছে লগআউট করবেন?'))) return;
    // Supabase keeps its session under its own key, so sign out explicitly.
    try { await signOut(); } catch {}
    clearSavedData();
    window.location.reload();
  };

  return (
    <div className="space-y-6 card-rise">
      <TabHeader
        icon={SlidersHorizontal}
        badge={t('Settings & Preferences', 'সেটিংস ও পছন্দ')}
        title={t('Theme & Language', 'থিম ও ভাষা পছন্দ')}
        description={t('Day mode uses fresh paddy green and harvest gold on a warm cream ground, easy to read outdoors. Night mode switches to a deep forest green that is gentle on the eyes.',
                       'দিনের মুডে উষ্ণ ঘিয়ে জমিনে ধানসবুজ ও সোনালি রং থাকে, যা বাইরে রোদেও পড়া সহজ; রাতের মুডে গাঢ় বনসবুজ থিম চালু হয়, যা চোখের জন্য আরামদায়ক।')}
      />

      <Card className="rounded-[var(--radius-card)] p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ThemeCard
            active={theme === 'day'} onClick={() => setTheme('day')}
            icon={<Sun className="h-4 w-4 text-amber-500" />}
            title={t('Day Mode', 'দিন মুড')} subtitle={t('Paddy green & harvest gold', 'ধানসবুজ ও সোনালি')}
            swatches={['#FAF6EA', '#FFFFFF', '#EDB224', '#2A7121']}
            style={{ background: '#FAF6EA', color: '#1B2B12' }}
          />
          <ThemeCard
            active={theme === 'night'} onClick={() => setTheme('night')}
            icon={<Moon className="h-4 w-4 text-amber-300" />}
            title={t('Night Mode', 'রাত মুড')} subtitle={t('Deep forest green', 'গাঢ় বনসবুজ')}
            swatches={['#0E1610', '#152019', '#34802A', '#9AD67E']}
            style={{ background: '#0E1610', color: '#F0F5EA' }}
          />
        </div>

        <div>
          <span className={labelClass}>{t('Language', 'ভাষা')}</span>
          <LangToggle size="md" full />
        </div>

        <div className="pt-4 border-t border-sky-500/10 space-y-2">
          <span className={labelClass}>{t('Saved data', 'সংরক্ষিত তথ্য')}</span>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('Your preferences are stored in this browser. Your farm profile and plans are also saved to your account, so clearing this device does not delete them.',
               'আপনার পছন্দ এই ব্রাউজারে সংরক্ষিত থাকে। খামারের তথ্য ও পরিকল্পনা আপনার অ্যাকাউন্টেও সংরক্ষিত থাকে, তাই এই ডিভাইস থেকে মুছলে সেগুলো মুছে যায় না।')}
          </p>
          <button type="button" onClick={resetAll} className="btn-popup min-h-tap text-sm font-medium flex items-center gap-1.5 text-red-700 dark:text-red-400 px-4 rounded-xl border border-red-500/30 hover:bg-red-500/5">
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
      className={`btn-popup p-5 rounded-2xl border text-left ${active ? 'border-sky-600 shadow-[inset_0_0_0_1px_rgb(var(--sky-600))]' : 'border-sky-600/15 hover:border-sky-600/40'}`}
      style={style}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold flex items-center gap-2" style={{ color: style.color }}>{icon}{title}</span>
        {active && <CheckCircle2 className="h-5 w-5" style={{ color: style.color }} />}
      </div>
      <p className="text-xs opacity-80" style={{ color: style.color }}>{subtitle}</p>
      <div className="mt-3 flex gap-1.5">
        {swatches.map(c => <span key={c} className="h-3 w-3 rounded-full border border-black/10" style={{ background: c }} />)}
      </div>
    </button>
  );
}
