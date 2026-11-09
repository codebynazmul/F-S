'use client';

import React from 'react';
import { FileText, Globe, Menu, Sliders, Sprout, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { SLIDE } from '@/lib/motion';
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
    `flex-1 min-h-[56px] flex flex-col items-center justify-center gap-1 rounded-xl text-xs transition-colors duration-150 ${
      active ? 'text-sky-800 dark:text-sky-300 font-medium' : 'text-slate-500 dark:text-slate-400'
    }`;

  return (
    <nav
      aria-label={t('Quick navigation', 'দ্রুত মেনু')}
      className="fs-bottom-nav lg:hidden fixed bottom-0 inset-x-0 z-30 glass-bar border-t border-sky-600/10 pb-safe"
    >
      <div className="flex items-stretch gap-1 px-2 pt-1 pb-1">
        {ITEMS.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id && !menuOpen;
          return (
            <button key={item.id} type="button" onClick={() => go(item.id)} aria-current={active ? 'page' : undefined} className={itemClass(active)}>
              <span className="relative px-4 py-1 rounded-full">
                {active && <motion.span layoutId="fs-bottom-active" transition={SLIDE} className="absolute inset-0 rounded-full bg-sky-600/10" aria-hidden />}
                <motion.span className="relative flex" whileTap={{ scale: 0.88 }}>
                  <Icon className="h-5 w-5" />
                </motion.span>
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
          <span className="relative px-4 py-1 rounded-full">
            {(menuOpen || !inMain) && <motion.span layoutId="fs-bottom-active" transition={SLIDE} className="absolute inset-0 rounded-full bg-sky-600/10" aria-hidden />}
            <motion.span className="relative flex" whileTap={{ scale: 0.88 }}>
              <Menu className="h-5 w-5" />
            </motion.span>
          </span>
          <span>{t('More', 'আরও')}</span>
        </button>
      </div>
    </nav>
  );
}
