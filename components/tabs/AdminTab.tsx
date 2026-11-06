'use client';

import React, { useState } from 'react';
import { AlertTriangle, BarChart3, History, KeyRound, ShieldCheck, Users, type LucideIcon } from 'lucide-react';
import { useApp } from '../AppProvider';
import { Card, TabHeader } from '../ui';
import AdminOverview from '../admin/AdminOverview';
import AdminUsers from '../admin/AdminUsers';
import AdminActivity from '../admin/AdminActivity';
import AdminSecurity from '../admin/AdminSecurity';

type Section = 'overview' | 'users' | 'activity' | 'security';

const SECTIONS: { id: Section; en: string; bn: string; icon: LucideIcon }[] = [
  { id: 'overview', en: 'Overview',     bn: 'সারসংক্ষেপ',   icon: BarChart3 },
  { id: 'users',    en: 'Users',        bn: 'ব্যবহারকারী',  icon: Users },
  { id: 'activity', en: 'Activity log', bn: 'কার্যক্রম লগ', icon: History },
  { id: 'security', en: 'Security',     bn: 'নিরাপত্তা',    icon: KeyRound },
];

export default function AdminTab() {
  const { t, n, lang, user, isAdmin, accounts, usingDefaultAdminPassword } = useApp();
  const [section, setSection] = useState<Section>('overview');

  if (!isAdmin || !user) return null;

  return (
    <div className="space-y-6 card-rise">
      <Card className="p-6 rounded-4xl space-y-6 shadow-xl">
        <TabHeader
          icon={ShieldCheck}
          accent="violet"
          badge={t('Admin Panel', 'অ্যাডমিন প্যানেল')}
          title={t('Manage Field Shift', 'ফিল্ড শিফট পরিচালনা')}
          description={<>{t('Signed in as', 'লগইন করেছেন')} <strong className="text-violet-600 dark:text-violet-300">{user.name}</strong></>}
        />

        {usingDefaultAdminPassword && (
          <div role="alert" className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-2xl border border-amber-500/40 bg-amber-500/15">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden />
            <p className="flex-1 text-sm text-amber-900 dark:text-amber-100">
              {t('You are using the default admin password. Change it so others cannot sign in as admin.',
                 'আপনি ডিফল্ট অ্যাডমিন পাসওয়ার্ড ব্যবহার করছেন। অন্য কেউ যেন অ্যাডমিন হিসেবে ঢুকতে না পারে, তাই এটি বদলে নিন।')}
            </p>
            <button
              type="button"
              onClick={() => setSection('security')}
              className="btn-popup min-h-tap px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shrink-0"
            >
              {t('Change password', 'পাসওয়ার্ড বদলান')}
            </button>
          </div>
        )}

        <div role="tablist" aria-label={t('Admin sections', 'অ্যাডমিন বিভাগ')} className="flex flex-wrap gap-1 p-1 rounded-2xl glass-subtle border border-sky-500/15 w-fit max-w-full">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const active = section === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                id={`admin-tab-${s.id}`}
                aria-selected={active}
                aria-controls="admin-section"
                onClick={() => setSection(s.id)}
                className={`btn-popup min-h-tap px-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
                  active ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {lang === 'bn' ? s.bn : s.en}
                {s.id === 'users' && <span className={`text-xs ${active ? 'text-violet-100' : 'text-slate-500'}`}>({n(accounts.length)})</span>}
              </button>
            );
          })}
        </div>

        <div id="admin-section" role="tabpanel" aria-labelledby={`admin-tab-${section}`}>
          {section === 'overview' && <AdminOverview />}
          {section === 'users' && <AdminUsers />}
          {section === 'activity' && <AdminActivity />}
          {section === 'security' && <AdminSecurity />}
        </div>
      </Card>
    </div>
  );
}
