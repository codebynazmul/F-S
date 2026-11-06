'use client';

import React, { useEffect } from 'react';
import {
  BarChart3, ChevronRight, FileText, Globe, Layers, LogOut, Menu, Moon, ShieldCheck,
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

      {/* Click outside to close */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 lg:bg-transparent" onClick={() => setMenuOpen(false)} aria-hidden />
      )}

      <aside
        id="fs-drawer"
        aria-label={t('Main navigation', 'প্রধান মেন্যু')}
        className={`fs-drawer glass-sidebar fixed top-0 bottom-0 left-0 z-50 w-80 max-w-[85vw] h-screen flex flex-col justify-between transition-[transform,visibility] duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
        }`}
      >
        <div className="p-5 pt-16 border-b border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <img src="/logo-sm.png" alt="" className="h-11 w-11 rounded-full object-cover shadow-lg shrink-0" />
            <div>
              <div className="text-base font-black tracking-tight text-slate-900 dark:text-white">{t('Field Shift', 'ফিল্ড শিফট')}</div>
              <span className="text-xs font-semibold block leading-tight text-sky-600 dark:text-sky-300">
                {t('Agricultural Decision Support System', 'কৃষি ডিসিশন সাপোর্ট সিস্টেম')}
              </span>
            </div>
          </div>

          <div className="glass-subtle rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar initials={user.initials} admin={user.role === 'admin'} />
              <div className="truncate">
                <div className="text-sm font-black truncate text-slate-900 dark:text-white">{user.name}</div>
                <span className={`text-xs font-bold block ${user.role === 'admin' ? 'text-violet-500' : 'text-sky-600 dark:text-sky-300'}`}>
                  {user.role === 'admin' ? t('Admin', 'অ্যাডমিন') : t('Farmer', 'কৃষক')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button type="button" onClick={() => go('user_account')} className="btn-popup h-11 w-11 flex items-center justify-center text-slate-500 hover:text-sky-600 rounded-xl" title={t('Edit Profile', 'প্রোফাইল সম্পাদন')} aria-label={t('Edit Profile', 'প্রোফাইল সম্পাদন')}>
                <UserIcon className="h-5 w-5" />
              </button>
              <button type="button" onClick={signOut} className="btn-popup h-11 w-11 flex items-center justify-center text-slate-500 hover:text-red-500 rounded-xl" title={t('Sign Out', 'লগআউট')} aria-label={t('Sign Out', 'লগআউট')}>
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider px-3 mb-2 block text-slate-500 dark:text-slate-400">
            {t('Main Navigation', 'প্রধান মেন্যু')}
          </span>
          {NAV_ITEMS.filter(i => !i.adminOnly || user.role === 'admin').map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => go(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`btn-popup min-h-tap w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold text-left ${
                  active ? 'bg-sky-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-sky-500'}`} />
                  <span className="leading-snug">{lang === 'bn' ? item.bn : item.en}</span>
                </span>
                {active && <ChevronRight className="h-4 w-4 shrink-0 text-white" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <LangToggle />
            <button
              type="button"
              onClick={() => setTheme(isNight ? 'day' : 'night')}
              className={`btn-popup min-h-tap flex items-center gap-1.5 px-3.5 rounded-xl glass-subtle text-sm font-bold ${isNight ? 'text-amber-300' : 'text-sky-600'}`}
            >
              {isNight ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{isNight ? t('Day', 'দিন') : t('Night', 'রাত')}</span>
            </button>
          </div>
          <div className="text-xs text-center text-slate-500 dark:text-slate-400">
            {t('Developed by SPIDERX', 'ডেভেলপড বাই SPIDERX')}
          </div>
        </div>
      </aside>
    </>
  );
}
