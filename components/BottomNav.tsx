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
    `flex-1 min-h-[62px] flex flex-col items-center justify-center gap-1 rounded-2xl text-xs cursor-pointer transition-colors duration-150 ${
      active ? 'text-sky-800 dark:text-sky-300 font-bold' : 'text-slate-600 dark:text-slate-400 font-medium'
    }`;

  return (
    <nav
      aria-label={t('Quick navigation', 'দ্রুত মেনু')}
      className="fs-bottom-nav lg:hidden fixed bottom-0 inset-x-0 z-30 glass-bar border-t border-sky-600/10 pb-safe shadow-[0_-8px_24px_-12px_var(--shadow-color)]"
    >
      <div className="flex items-stretch gap-1 px-2 pt-1 pb-1">
        {ITEMS.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id && !menuOpen;
          return (
            <button key={item.id} type="button" onClick={() => go(item.id)} aria-current={active ? 'page' : undefined} className={itemClass(active)}>
<<<<<<< Updated upstream
              <span className={`px-4 py-1 rounded-full transition-colors duration-150 ${active ? 'bg-sky-600/10' : ''}`}>
                <Icon className="h-5 w-5" />
=======
              <span className={`relative px-5 py-1.5 rounded-full transition-colors duration-150 ${active ? 'text-white' : ''}`}>
                {active && <motion.span layoutId="fs-bottom-active" transition={SLIDE} className="absolute inset-0 rounded-full fs-btn-primary" aria-hidden />}
                <motion.span className="relative flex" whileTap={{ scale: 0.88 }}>
                  <Icon className="h-[22px] w-[22px]" />
                </motion.span>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
          <span className={`px-4 py-1 rounded-full transition-colors duration-150 ${menuOpen || !inMain ? 'bg-sky-600/10' : ''}`}>
            <Menu className="h-5 w-5" />
=======
          <span className={`relative px-5 py-1.5 rounded-full transition-colors duration-150 ${menuOpen || !inMain ? 'text-white' : ''}`}>
            {(menuOpen || !inMain) && <motion.span layoutId="fs-bottom-active" transition={SLIDE} className="absolute inset-0 rounded-full fs-btn-primary" aria-hidden />}
            <motion.span className="relative flex" whileTap={{ scale: 0.88 }}>
              <Menu className="h-[22px] w-[22px]" />
            </motion.span>
>>>>>>> Stashed changes
          </span>
          <span>{t('More', 'আরও')}</span>
        </button>
      </div>
    </nav>
  );
}
