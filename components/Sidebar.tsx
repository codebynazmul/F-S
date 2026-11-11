'use client';

import React, { useEffect } from 'react';
import {
  BarChart3, FileText, Globe, Layers, Moon, MoreVertical, Sliders, Sprout, Sun, X, type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { useApp } from './AppProvider';
import { SLIDE, iconSwap } from '@/lib/motion';
import { LangToggle } from './ui';
import type { TabId } from '@/lib/types';

interface NavItem { id: TabId; en: string; bn: string; icon: LucideIcon }

/** Each section has its own tile colour so it's easy to find again by sight. */
const TILE: Record<TabId, string> = {
  rotation:     'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  whatif:       'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
  analytics:    'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300',
  nasa:         'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  farm_profile: 'bg-soil-100 text-soil-700 dark:bg-soil-500/25 dark:text-soil-200',
  report:       'bg-harvest-200 text-harvest-900 dark:bg-harvest-500/25 dark:text-harvest-200',
};

export const NAV_ITEMS: NavItem[] = [
  { id: 'rotation',     en: 'Crop Rotation Optimizer',   bn: 'ফসল পর্যায়ক্রম অপটিমাইজার',     icon: Sprout },
  { id: 'whatif',       en: 'What-If Climate Simulator', bn: 'জলবায়ু সিমুলেটর (হোয়াট-ইফ)',  icon: Sliders },
  { id: 'analytics',    en: 'Soil & Water Analytics',    bn: 'মাটি ও পানির তুলনা',            icon: BarChart3 },
  { id: 'nasa',         en: 'NASA Earth Data',           bn: 'নাসা আর্থ পর্যবেক্ষণ',          icon: Globe },
  { id: 'farm_profile', en: 'Farm & Soil Profile',       bn: 'খামার ও মাটির ল্যাব তথ্য',      icon: Layers },
  { id: 'report',       en: 'Farm Action Dossier',       bn: 'কৃষক কর্মপরিকল্পনা রিপোর্ট',      icon: FileText },
];

// Menu items slide in one after another each time the menu opens.
const listStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } },
};
const itemSlide: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

export default function Sidebar() {
  const { t, lang, user, activeTab, setActiveTab, menuOpen, setMenuOpen, isNight, setTheme } = useApp();

  // Close on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, setMenuOpen]);

  if (!user) return null;
  const go = (id: TabId) => { setActiveTab(id); setMenuOpen(false); window.scrollTo({ top: 0 }); };

  return (
    <>
      <button
        type="button"
        onClick={() => setMenuOpen(prev => !prev)}
        className={`fs-fab ${menuOpen ? 'is-open' : ''}`}
        aria-label={menuOpen ? t('Close menu', 'মেনু বন্ধ করুন') : t('Open menu', 'মেনু খুলুন')}
        aria-expanded={menuOpen}
        aria-controls="fs-drawer"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={menuOpen ? 'close' : 'menu'} {...iconSwap} className="flex">
            {menuOpen ? <X className="h-6 w-6" /> : <MoreVertical className="h-6 w-6" />}
          </motion.span>
        </AnimatePresence>
      </button>

      {/* Click outside to close */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <aside
        id="fs-drawer"
        aria-label={t('Main navigation', 'প্রধান মেন্যু')}
        className={`fs-drawer fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] h-screen flex flex-col bg-[var(--bg-page)] border-r border-sky-600/10 shadow-2xl transition-[transform,visibility] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] ${
          menuOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
        }`}
      >
        <div className="px-5 pt-[4.25rem] pb-5">
          <div className="flex items-center gap-3">
            <img src="/logo-sm.png" alt="" className="h-12 w-12 rounded-2xl object-cover shrink-0 shadow-leaf" />
            <div className="min-w-0">
              <div className="fs-display text-xl text-slate-900 dark:text-white">{t('Agro Cosmic Weave', 'অ্যাগ্রো কসমিক উইভ')}</div>
              <span className="text-xs block leading-tight text-slate-500 dark:text-slate-400">
                {t('Crop and soil planner', 'ফসল ও মাটির পরিকল্পনা')}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <span className="fs-eyebrow px-3 mb-2 block">
            {t('Menu', 'মেন্যু')}
          </span>
          <motion.div className="space-y-1 isolate" variants={listStagger} initial="hidden" animate={menuOpen ? 'show' : 'hidden'}>
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <motion.button
                  variants={itemSlide}
                  type="button"
                  key={item.id}
                  onClick={() => go(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`group fs-nav-link relative min-h-[52px] w-full flex items-center gap-3 px-2 py-1.5 rounded-2xl text-[0.9375rem] text-left cursor-pointer transition-colors duration-150 ${
                    active
                      ? 'text-white font-semibold'
                      : 'text-slate-700 dark:text-slate-300 font-medium hover:bg-sky-600/[0.07] hover:text-slate-900'
                  }`}
                >
                  {/* One green pill that slides to whichever item is active. */}
                  {active && (
                    <motion.span layoutId="fs-sidebar-active" transition={SLIDE} className="absolute inset-0 -z-10 rounded-2xl fs-btn-primary" aria-hidden />
                  )}
                  <span className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                    active ? 'bg-white/20 text-white' : TILE[item.id]
                  }`}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="leading-snug">{lang === 'bn' ? item.bn : item.en}</span>
                </motion.button>
              );
            })}
          </motion.div>
        </nav>

        <div className="p-4 border-t border-sky-600/10 flex items-center justify-between gap-2">
          <LangToggle />
          <button
            type="button"
            onClick={() => setTheme(isNight ? 'day' : 'night')}
            className="btn-popup min-h-[44px] flex items-center gap-1.5 px-3.5 rounded-full border border-sky-600/20 bg-[var(--bg-surface)] text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            aria-label={isNight ? t('Switch to day mode', 'দিন মোডে যান') : t('Switch to night mode', 'রাত মোডে যান')}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={isNight ? 'sun' : 'moon'} {...iconSwap} className="flex">
                {isNight ? <Sun className="h-4 w-4 text-harvest-300" /> : <Moon className="h-4 w-4 text-sky-700" />}
              </motion.span>
            </AnimatePresence>
            <span>{isNight ? t('Day', 'দিন') : t('Night', 'রাত')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
