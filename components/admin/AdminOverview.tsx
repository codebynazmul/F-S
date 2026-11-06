'use client';

import React, { useMemo } from 'react';
import { Ban, ShieldCheck, UserPlus, Users, Zap } from 'lucide-react';
import { CROP_DATABASE } from '@/data/crops';
import { DIVISIONS, divisionName } from '@/lib/options';
import { recommendPlan } from '@/lib/recommend';
import { DEFAULT_FARM, useApp } from '../AppProvider';
import { SubCard } from '../ui';
import { BarList, DAY_MS, METHOD_LABEL, StatTile, contactOf, districtOf, formatTime } from './shared';

/** Counts items by key and returns them largest first. */
function tally<T>(list: T[], keyOf: (item: T) => string[]): { label: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const item of list) for (const key of keyOf(item)) counts.set(key, (counts.get(key) ?? 0) + 1);
  return Array.from(counts, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export default function AdminOverview() {
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
      recent: [...accounts].sort((a, b) => b.lastLoginAt - a.lastLoginAt).slice(0, 5),
    };
  }, [accounts, lang, t]);

  // Keep the division chart in the fixed division order, with "not set" last.
  const divisionOrder = DIVISIONS.map(d => divisionName(d.id, lang));
  const byDivision = [...stats.byDivision].sort((a, b) => {
    const ia = divisionOrder.indexOf(a.label);
    const ib = divisionOrder.indexOf(b.label);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

  const empty = t('No users yet.', 'এখনো কোনো ব্যবহারকারী নেই।');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatTile icon={Users} label={t('Total users', 'মোট ব্যবহারকারী')} value={n(accounts.length)} />
        <StatTile icon={Zap} label={t('Active, last 7 days', 'গত ৭ দিনে সক্রিয়')} value={n(stats.active)} tone="emerald" />
        <StatTile icon={UserPlus} label={t('New, last 7 days', 'গত ৭ দিনে নতুন')} value={n(stats.newThisWeek)} />
        <StatTile icon={Ban} label={t('Blocked', 'ব্লক করা')} value={n(stats.blocked)} tone="red" />
        <StatTile icon={ShieldCheck} label={t('Admins', 'অ্যাডমিন')} value={n(stats.admins + 1)} tone="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarList title={t('Users by division', 'বিভাগ অনুযায়ী ব্যবহারকারী')} items={byDivision} empty={empty} />
        <BarList title={t('Top districts', 'শীর্ষ জেলা')} items={stats.byDistrict} empty={empty} />
        <BarList title={t('Most recommended crops', 'সবচেয়ে বেশি সুপারিশকৃত ফসল')} items={stats.crops} empty={empty} />
        <BarList title={t('Sign-in method', 'সাইন-ইন পদ্ধতি')} items={stats.byMethod} empty={empty} />
      </div>

      <SubCard className="p-5 rounded-2xl space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50">{t('Recent sign-ins', 'সাম্প্রতিক সাইন-ইন')}</h3>
        {stats.recent.length === 0 ? (
          <p className="text-xs text-slate-600 dark:text-slate-400">{empty}</p>
        ) : (
          <ul className="divide-y divide-sky-500/10">
            {stats.recent.map(a => (
              <li key={a.id} className="py-2 flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                <span className="font-bold">{a.name} <span className="font-normal text-slate-600 dark:text-slate-400">· {contactOf(a)}</span></span>
                <span className="text-xs text-slate-600 dark:text-slate-400">{formatTime(a.lastLoginAt, lang)}</span>
              </li>
            ))}
          </ul>
        )}
      </SubCard>

      <p className="text-xs text-slate-600 dark:text-slate-400">
        {t('Demo: these numbers only include accounts used in this browser. A shared backend is needed to see every farmer.',
           'ডেমো: এই হিসাবে শুধু এই ব্রাউজারে ব্যবহৃত অ্যাকাউন্টগুলো আছে। সব কৃষকের তথ্য দেখতে একটি শেয়ার্ড ব্যাকএন্ড প্রয়োজন।')}
      </p>
    </div>
  );
}
