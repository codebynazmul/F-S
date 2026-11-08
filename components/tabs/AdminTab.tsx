'use client';

import React, { useRef, useState } from 'react';
import { AlertTriangle, BarChart3, History, KeyRound, RefreshCw, ShieldCheck, Users, X, type LucideIcon } from 'lucide-react';
import { useApp } from '../AppProvider';
import { Card } from '../ui';
import AdminOverview from '../admin/AdminOverview';
import AdminUsers, { type UserFilter } from '../admin/AdminUsers';
import AdminActivity from '../admin/AdminActivity';
import AdminSecurity from '../admin/AdminSecurity';
import { DAY_MS, eyebrow, focusRing, relativeTime } from '../admin/shared';

type Section = 'overview' | 'users' | 'activity' | 'security';

const SECTIONS: { id: Section; en: string; bn: string; icon: LucideIcon }[] = [
  { id: 'overview', en: 'Overview',     bn: 'সারসংক্ষেপ',   icon: BarChart3 },
  { id: 'users',    en: 'Users',        bn: 'ব্যবহারকারী',  icon: Users },
  { id: 'activity', en: 'Activity log', bn: 'কার্যক্রম লগ', icon: History },
  { id: 'security', en: 'Security',     bn: 'নিরাপত্তা',    icon: KeyRound },
];

export default function AdminTab() {
  const { t, n, lang, user, isAdmin, accounts, adminLog, adminError, clearAdminError, admin } = useApp();
  const [reloading, setReloading] = useState(false);
  const [section, setSection] = useState<Section>('overview');
  const [userFilter, setUserFilter] = useState<UserFilter>('all');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (!isAdmin || !user) return null;

  const openUsers = (filter: UserFilter) => { setUserFilter(filter); setSection('users'); };

  // Left and right arrows move between tabs, Home and End jump to the ends.
  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    const last = SECTIONS.length - 1;
    const next = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setSection(SECTIONS[next].id);
    tabRefs.current[next]?.focus();
  };

  const now = Date.now();
  const active = accounts.filter(a => now - a.lastLoginAt < 7 * DAY_MS).length;
  const lastEvent = adminLog[0];
  const facts = [
    { label: t('Users', 'ব্যবহারকারী'), value: n(accounts.length) },
    { label: t('Active this week', 'এই সপ্তাহে সক্রিয়'), value: n(active) },
    { label: t('Last activity', 'শেষ কার্যক্রম'), value: lastEvent ? relativeTime(lastEvent.at, lang) : '—' },
  ];

  return (
    <div className="card-rise">
      <Card className="rounded-4xl overflow-hidden">
        <header className="px-5 sm:px-8 pt-6 sm:pt-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-2 min-w-0">
              <p className={`${eyebrow} flex items-center gap-2`}>
                <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden />
                {t('Admin panel', 'অ্যাডমিন প্যানেল')}
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                {t('Manage Field Shift', 'ফিল্ড শিফট পরিচালনা')}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{t('Signed in as', 'লগইন করেছেন')} <span className="font-semibold text-slate-900 dark:text-slate-50">{user.name}</span></span>
                <button
                  type="button"
                  disabled={reloading}
                  onClick={async () => { setReloading(true); await admin.reload(); setReloading(false); }}
                  className={`inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:underline disabled:opacity-60 rounded ${focusRing}`}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${reloading ? 'animate-spin' : ''}`} aria-hidden />
                  {reloading ? t('Refreshing…', 'হালনাগাদ হচ্ছে…') : t('Refresh', 'হালনাগাদ করুন')}
                </button>
              </p>
            </div>

            <dl className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden border border-[var(--border-soft)] bg-[var(--border-soft)] lg:min-w-[26rem]">
              {facts.map(f => (
                <div key={f.label} className="bg-[var(--bg-surface-2)] px-3 sm:px-4 py-3 min-w-0">
                  <dt className="text-xs leading-4 text-slate-500 dark:text-slate-400">{f.label}</dt>
                  <dd className="mt-1 text-sm sm:text-base font-semibold leading-5 tabular-nums text-slate-900 dark:text-slate-50">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {adminError && (
            <div role="alert" className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border border-red-500/40 bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" aria-hidden />
              <p className="flex-1 text-sm text-red-900 dark:text-red-100">
                {t('The last change could not be saved: ', 'শেষ পরিবর্তনটি সংরক্ষণ করা যায়নি: ')}{adminError}
              </p>
              <button
                type="button"
                onClick={clearAdminError}
                className={`inline-flex items-center justify-center gap-1.5 min-h-tap px-4 rounded-xl border border-red-500/40 text-sm font-semibold shrink-0 ${focusRing}`}
              >
                <X className="h-4 w-4" aria-hidden />{t('Dismiss', 'বন্ধ করুন')}
              </button>
            </div>
          )}

          <div
            role="tablist"
            aria-label={t('Admin sections', 'অ্যাডমিন বিভাগ')}
            className="-mx-5 sm:-mx-8 px-5 sm:px-8 flex gap-1 overflow-x-auto border-b border-[var(--border-soft)] [scrollbar-width:none]"
          >
            {SECTIONS.map((s, i) => {
              const Icon = s.icon;
              const selected = section === s.id;
              return (
                <button
                  key={s.id}
                  ref={el => { tabRefs.current[i] = el; }}
                  type="button"
                  role="tab"
                  id={`admin-tab-${s.id}`}
                  aria-selected={selected}
                  aria-controls="admin-section"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setSection(s.id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={`group relative min-h-tap px-3 pb-3 pt-2 flex items-center gap-2 text-sm font-semibold whitespace-nowrap rounded-t-lg transition-colors ${focusRing} ${
                    selected ? 'text-slate-900 dark:text-slate-50' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${selected ? 'text-sky-600 dark:text-sky-400' : ''}`} aria-hidden />
                  {lang === 'bn' ? s.bn : s.en}
                  {s.id === 'users' && (
                    <span className="ml-0.5 px-1.5 rounded-md text-xs tabular-nums bg-slate-400/15 text-slate-600 dark:text-slate-300">{n(accounts.length)}</span>
                  )}
                  <span
                    aria-hidden
                    className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-sky-600 dark:bg-sky-400 origin-left transition-transform duration-300 ease-out ${
                      selected ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50 opacity-60'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </header>

        <div id="admin-section" role="tabpanel" aria-labelledby={`admin-tab-${section}`} className="px-5 sm:px-8 py-6 sm:py-8">
          {section === 'overview' && <AdminOverview onOpenUsers={openUsers} />}
          {section === 'users' && <AdminUsers filter={userFilter} onFilterChange={setUserFilter} />}
          {section === 'activity' && <AdminActivity />}
          {section === 'security' && <AdminSecurity />}
        </div>
      </Card>
    </div>
  );
}
