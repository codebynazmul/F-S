'use client';

import React, { useMemo } from 'react';
import { Ban, ShieldCheck, UserPlus, Users, Zap } from 'lucide-react';
import { CROP_DATABASE } from '@/data/crops';
import { DIVISIONS, divisionName } from '@/lib/options';
import { recommendPlan } from '@/lib/recommend';
import { DEFAULT_FARM, useApp } from '../AppProvider';
import type { UserFilter } from './AdminUsers';
import {
  AdminAvatar, BarList, BlockHead, DAY_MS, FootNote, METHOD_LABEL, StatTile,
  contactOf, districtOf, formatTime, panel, relativeTime,
} from './shared';

/** Counts items by key and returns them largest first. */
function tally<T>(list: T[], keyOf: (item: T) => string[]): { label: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const item of list) for (const key of keyOf(item)) counts.set(key, (counts.get(key) ?? 0) + 1);
  return Array.from(counts, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export default function AdminOverview({ onOpenUsers }: { onOpenUsers: (filter: UserFilter) => void }) {
  const { t, n, lang, accounts } = useApp();

  const stats = useMemo(() => {
    const now = Date.now();
    const notSet = t('Not set yet', 'এখনো নির্বাচন হয়নি');
    return {
      active: accounts.filter(a => now - a.lastLoginAt < 7 * DAY_MS).length,
      newThisWeek: accounts.filter(a => now - a.createdAt < 7 * DAY_MS).length,
      blocked: accounts.filter(a => a.blocked).length,
      admins: accounts.filter(a => a.role === 'admin').length,
      byDivision: tally(accounts, a => {
        const d = districtOf(a);
        return [d ? divisionName(d.division, lang) : notSet];
      }),
      byDistrict: tally(accounts.filter(a => districtOf(a)), a => {
        const d = districtOf(a)!;
        return [lang === 'bn' ? d.nameBn : d.name];
      }).slice(0, 5),
      byMethod: tally(accounts, a => [t(...METHOD_LABEL[a.method])]),
      // Each crop counts once per person whose recommended plan includes it.
      crops: tally(accounts.filter(a => districtOf(a)), a => {
        const plan = recommendPlan(districtOf(a)!, { ...DEFAULT_FARM, ...a.farm }).plan;
        return Array.from(new Set(plan)).map(id => {
          const crop = CROP_DATABASE[id];
          return crop ? (lang === 'bn' ? crop.nameBn : crop.name) : id;
        });
      }).slice(0, 6),
      recent: [...accounts].sort((a, b) => b.lastLoginAt - a.lastLoginAt).slice(0, 6),
    };
  }, [accounts, lang, t]);

  // Keep the division chart in the fixed division order, with "not set" last.
  const divisionOrder = DIVISIONS.map(d => divisionName(d.id, lang));
  const byDivision = [...stats.byDivision].sort((a, b) => {
    const ia = divisionOrder.indexOf(a.label);
    const ib = divisionOrder.indexOf(b.label);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

  const total = accounts.length;
  const share = (count: number) => t(`${n(Math.round((count / Math.max(1, total)) * 100))}% of users`, `ব্যবহারকারীর ${n(Math.round((count / Math.max(1, total)) * 100))}%`);
  const empty = t('No users yet.', 'এখনো কোনো ব্যবহারকারী নেই।');
  const openList = t('Open the user list', 'ব্যবহারকারী তালিকা খুলুন');

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatTile icon={Users} label={t('Total users', 'মোট ব্যবহারকারী')} value={n(total)}
          note={t('All accounts', 'সব অ্যাকাউন্ট')} onClick={() => onOpenUsers('all')} actionLabel={openList} />
        <StatTile icon={Zap} tone="emerald" label={t('Active, 7 days', 'সক্রিয়, ৭ দিন')} value={n(stats.active)} note={share(stats.active)} />
        <StatTile icon={UserPlus} label={t('New, 7 days', 'নতুন, ৭ দিন')} value={n(stats.newThisWeek)} note={share(stats.newThisWeek)} />
        <StatTile icon={Ban} tone="red" label={t('Blocked', 'ব্লক করা')} value={n(stats.blocked)}
          note={share(stats.blocked)} onClick={() => onOpenUsers('blocked')} actionLabel={openList} />
        <div className="col-span-2 lg:col-span-1">
          <StatTile icon={ShieldCheck} tone="ink" label={t('Admins', 'অ্যাডমিন')} value={n(stats.admins + 1)}
            note={t('Including the built-in admin', 'বিল্ট-ইন অ্যাডমিন সহ')} onClick={() => onOpenUsers('admin')} actionLabel={openList} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
        <BarList title={t('Users by division', 'বিভাগ অনুযায়ী ব্যবহারকারী')} items={byDivision} empty={empty} />
        <BarList title={t('Top districts', 'শীর্ষ জেলা')} items={stats.byDistrict} empty={empty} />
        <BarList title={t('Most recommended crops', 'সবচেয়ে বেশি সুপারিশকৃত ফসল')} items={stats.crops} empty={empty} />
        <BarList title={t('Sign-in method', 'সাইন-ইন পদ্ধতি')} items={stats.byMethod} empty={empty} />
      </div>

      <section className={`${panel} p-5 space-y-3`}>
        <BlockHead
          title={t('Recent sign-ins', 'সাম্প্রতিক সাইন-ইন')}
          meta={stats.recent.length > 0 ? t(`Latest ${stats.recent.length}`, `সর্বশেষ ${n(stats.recent.length)}`) : undefined}
        />
        {stats.recent.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{empty}</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {stats.recent.map(a => (
              <li key={a.id} className="py-3 flex items-center gap-3 border-b border-[var(--border-soft)] last:border-b-0">
                <AdminAvatar name={a.name || a.email} admin={a.role === 'admin'} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate text-slate-900 dark:text-slate-50">{a.name}</div>
                  <div className="text-xs truncate text-slate-500 dark:text-slate-400">{contactOf(a)}</div>
                </div>
                <time dateTime={new Date(a.lastLoginAt).toISOString()} title={formatTime(a.lastLoginAt, lang)}
                  className="text-xs tabular-nums whitespace-nowrap text-slate-500 dark:text-slate-400">
                  {relativeTime(a.lastLoginAt, lang)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <FootNote>
        {t('Demo: these numbers only include accounts used in this browser. A shared backend is needed to see every farmer.',
           'ডেমো: এই হিসাবে শুধু এই ব্রাউজারে ব্যবহৃত অ্যাকাউন্টগুলো আছে। সব কৃষকের তথ্য দেখতে একটি শেয়ার্ড ব্যাকএন্ড প্রয়োজন।')}
      </FootNote>
    </div>
  );
}
