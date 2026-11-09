'use client';

import React, { useEffect } from 'react';
import {
  BarChart3, FileText, Globe, Layers, LogOut, Menu, Moon, ShieldCheck,
  Sliders, SlidersHorizontal, Sprout, Sun, User as UserIcon, X, type LucideIcon,
} from 'lucide-react';
import { useApp } from './AppProvider';
import { Avatar, LangToggle } from './ui';
import type { TabId } from '@/lib/types';

interface NavItem { id: TabId; en: string; bn: string; icon: LucideIcon; adminOnly?: boolean }

export const NAV_ITEMS: NavItem[] = [
  { id: 'rotation',     en: 'Crop Rotation Optimizer',   bn: 'ফসল পর্যায়ক্রম অপটিমাইজার',     icon: Sprout },
  { id: 'whatif',       en: 'What-If Climate Simulator', bn: 'জলবায়ু সিমুলেটর (হোয়াট-ইফ)',  icon: Sliders },
  { id: 'analytics',    en: 'Soil & Water Analytics',    bn: 'মাটি ও পানির তুলনা',            icon: BarChart3 },
  { id: 'nasa',         en: 'NASA Earth Data',           bn: 'নাসা আর্থ পর্যবেক্ষণ',          icon: Globe },
  { id: 'farm_profile', en: 'Farm & Soil Profile',       bn: 'খামার ও মাটির ল্যাব তথ্য',      icon: Layers },
  { id: 'user_account', en: 'My Account',                bn: 'আমার একাউন্ট ও প্রোফাইল',        icon: UserIcon },
  { id: 'settings',     en: 'Settings & Theme',          bn: 'সেটিংস ও থিম',                 icon: SlidersHorizontal },
  { id: 'admin',        en: 'Admin Panel',               bn: 'অ্যাডমিন প্যানেল',               icon: ShieldCheck, adminOnly: true },
  { id: 'report',       en: 'Farm Action Dossier',       bn: 'কৃষক কর্মপরিকল্পনা রিপোর্ট',      icon: FileText },
];

export default function Sidebar() {
  const { t, lang, user, activeTab, setActiveTab, menuOpen, setMenuOpen, isNight, setTheme, signOut } = useApp();

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
        {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Click outside to close (phones and tablets) */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden />
      )}

      <aside
        id="fs-drawer"
        aria-label={t('Main navigation', 'প্রধান মেন্যু')}
        className={`fs-drawer fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] h-screen flex flex-col bg-[var(--bg-page)] border-r border-sky-600/10 transition-[transform,visibility] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] lg:translate-x-0 lg:visible ${
          menuOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
        }`}
      >
        <div className="px-5 pt-[4.25rem] lg:pt-6 pb-5">
          <div className="flex items-center gap-3">
            <img src="/logo-sm.png" alt="" className="h-10 w-10 rounded-xl object-cover shrink-0" />
            <div className="min-w-0">
              <div className="fs-display text-lg text-slate-900 dark:text-white">{t('Field Shift', 'ফিল্ড শিফট')}</div>
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
          <div className="space-y-0.5">
            {NAV_ITEMS.filter(i => !i.adminOnly || user.role === 'admin').map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => go(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`fs-nav-link min-h-tap w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors duration-150 ${
                    active
                      ? 'bg-sky-600/[0.08] text-sky-800 dark:text-sky-300 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-sky-600/5 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-sky-700 dark:text-sky-300' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="leading-snug">{lang === 'bn' ? item.bn : item.en}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-sky-600/10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <LangToggle />
            <button
              type="button"
              onClick={() => setTheme(isNight ? 'day' : 'night')}
              className="btn-popup min-h-[40px] flex items-center gap-1.5 px-3 rounded-xl border border-sky-600/15 bg-[var(--bg-surface)] text-sm font-medium text-slate-700 dark:text-slate-200"
              aria-label={isNight ? t('Switch to day mode', 'দিন মোডে যান') : t('Switch to night mode', 'রাত মোডে যান')}
            >
              {isNight ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-sky-700" />}
              <span>{isNight ? t('Day', 'দিন') : t('Night', 'রাত')}</span>
            </button>
          </div>

          <div className="rounded-2xl border border-sky-600/10 bg-[var(--bg-surface)] p-2.5 flex items-center justify-between gap-2">
            <button type="button" onClick={() => go('user_account')} className="flex items-center gap-2.5 min-w-0 text-left rounded-xl p-1 -m-1 hover:bg-sky-600/5 transition-colors" aria-label={t('Edit Profile', 'প্রোফাইল সম্পাদন')}>
              <Avatar initials={user.initials} admin={user.role === 'admin'} />
              <span className="truncate">
                <span className="text-sm font-medium truncate block text-slate-900 dark:text-white">{user.name}</span>
                <span className="text-xs block text-slate-500 dark:text-slate-400">
                  {user.role === 'admin' ? t('Admin', 'অ্যাডমিন') : t('Farmer', 'কৃষক')}
                </span>
              </span>
            </button>
            <button type="button" onClick={signOut} className="btn-popup h-11 w-11 shrink-0 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-500/5 rounded-xl" title={t('Sign Out', 'লগআউট')} aria-label={t('Sign Out', 'লগআউট')}>
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
