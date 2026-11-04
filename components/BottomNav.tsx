'use client';

import React from 'react';
import { FileText, Globe, Menu, Sliders, Sprout, type LucideIcon } from 'lucide-react';
import { useApp } from './AppProvider';
import type { TabId } from '@/lib/types';

const ITEMS: { id: TabId; en: string; bn: string; icon: LucideIcon }[] = [
  { id: 'rotation', en: 'Plan',    bn: 'পরিকল্পনা', icon: Sprout },
  { id: 'whatif',   en: 'What-If', bn: 'সিমুলেটর',  icon: Sliders },
  { id: 'nasa',     en: 'NASA',    bn: 'নাসা',      icon: Globe },
  { id: 'report',   en: 'Report',  bn: 'রিপোর্ট',   icon: FileText },
];

/** Bottom tab bar for phones and small tablets. "More" opens the full side menu. */
export default function BottomNav() {
  const { t, lang, activeTab, setActiveTab, menuOpen, setMenuOpen } = useApp();
  const inMain = ITEMS.some(i => i.id === activeTab);

  const go = (id: TabId) => {
    setActiveTab(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  const itemClass = (active: boolean) =>
    `flex-1 min-h-[56px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-bold transition-colors ${
      active ? 'text-sky-700 dark:text-sky-300' : 'text-slate-600 dark:text-slate-400'
    }`;

  return (
    <nav
      aria-label={t('Quick navigation', 'দ্রুত মেনু')}
      className="fs-bottom-nav lg:hidden fixed bottom-0 inset-x-0 z-30 glass-bar border-t border-sky-500/15 pb-safe"
    >
      <div className="flex items-stretch gap-1 px-2 pt-1 pb-1">
        {ITEMS.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id && !menuOpen;
          return (
            <button key={item.id} type="button" onClick={() => go(item.id)} aria-current={active ? 'page' : undefined} className={itemClass(active)}>
              <span className={`px-4 py-1 rounded-full transition-colors ${active ? 'bg-sky-500/15' : ''}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span>{lang === 'bn' ? item.bn : item.en}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setMenuOpen(o => !o)}
          aria-expanded={menuOpen}
          aria-controls="fs-drawer"
          className={itemClass(menuOpen || !inMain)}
        >
          <span className={`px-4 py-1 rounded-full transition-colors ${menuOpen || !inMain ? 'bg-sky-500/15' : ''}`}>
            <Menu className="h-5 w-5" />
          </span>
          <span>{t('More', 'আরও')}</span>
        </button>
      </div>
    </nav>
  );
}
