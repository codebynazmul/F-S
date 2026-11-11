'use client';

import React, { useState } from 'react';
import { BarChart3, Droplets, Layers } from 'lucide-react';
import { performanceScores, projectOrganicMatter } from '@/lib/metrics';
import { useApp } from '../AppProvider';
import { Card, Meter, SubCard, TabHeader, titleText } from '../ui';

export default function AnalyticsTab() {
  const { t, n, lang, district, farm, recMetrics, tradMetrics } = useApp();

  const rec = performanceScores(recMetrics);
  const trad = performanceScores(tradMetrics);
  const rows = [
    { key: 'water', en: 'Water Conservation', bn: 'পানির সাশ্রয়' },
    { key: 'organic', en: 'Soil Health', bn: 'মাটির স্বাস্থ্য' },
    { key: 'nitrogen', en: 'Nitrogen Balance', bn: 'প্রাকৃতিক নাইট্রোজেন যোগ' },
    { key: 'drought', en: 'Drought Survival', bn: 'খরা ও তাপদাহ টিকে থাকা' },
    { key: 'pest', en: 'Crop Diversity (pest break)', bn: 'ফসল বৈচিত্র্য (পোকা দমন চক্র)' },
  ] as const;

  const recSom = projectOrganicMatter(recMetrics, farm.organicMatter);
  const tradSom = projectOrganicMatter(tradMetrics, farm.organicMatter);
  const years = [t('Today', 'বর্তমান'), t('Year 1', '১ম বছর'), t('Year 2', '২য় বছর'), t('Year 3', '৩য় বছর')];

  const somDelta = (s: number[]) => `${s[3] >= s[0] ? '+' : ''}${n(s[3] - s[0], 2)}%`;

  return (
    <div className="space-y-6 card-rise">
      <TabHeader
        icon={Droplets}
        badge={t(`Soil and water · ${district.name}`, `মাটি ও পানি · ${district.nameBn}`)}
        title={t('Soil and water analytics', 'মাটি ও পানির বিশ্লেষণ')}
        description={t('Your plan against current practice on five scores, and how soil organic matter changes over three years.',
                       'পাঁচটি স্কোরে আপনার পরিকল্পনা বনাম প্রচলিত চাষ, এবং তিন বছরে মাটির জৈব পদার্থ কীভাবে বদলায়।')}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 sm:p-6 rounded-[var(--radius-card)] space-y-4">
          <h2 className={`fs-display text-[1.25rem] lg:text-[1.5rem] ${titleText} flex items-center gap-2.5`}>
            <BarChart3 className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>{t('Rotation Performance Comparison', 'ফসল পর্যায়ক্রমের সার্বিক তুলনা')}</span>
          </h2>
          <Legend />

          <div className="space-y-5 pt-1">
            {rows.map(r => (
              <div key={r.key} className="space-y-1.5">
                <div className="flex justify-between gap-3 text-sm font-medium">
                  <span>{lang === 'bn' ? r.bn : r.en}</span>
                  <span className="whitespace-nowrap">
                    <strong className="text-sky-600 dark:text-sky-300">{n(rec[r.key])}</strong>
                    <span className="text-slate-500 font-normal"> {t('vs', 'বনাম')} </span>
                    <span className="text-amber-600 dark:text-amber-400">{n(trad[r.key])}</span>
                  </span>
                </div>
                <Meter value={rec[r.key]} color="bg-sky-500" label={`${lang === 'bn' ? r.bn : r.en}: ${t('recommended', 'প্রস্তাবিত')}`} />
                <Meter value={trad[r.key]} color="bg-amber-500/80" label={`${lang === 'bn' ? r.bn : r.en}: ${t('current', 'প্রচলিত')}`} />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('Scores are 0–100 from the Agro Cosmic Weave screening model for the selected district and your farm profile. Higher is better.',
               'স্কোর ০–১০০, নির্বাচিত জেলা ও আপনার খামারের তথ্যের ভিত্তিতে অ্যাগ্রো কসমিক উইভ মডেল থেকে হিসাব করা। বেশি হলে ভালো।')}
          </p>
        </Card>

        <Card className="p-5 sm:p-6 rounded-[var(--radius-card)] space-y-4">
          <h2 className={`fs-display text-[1.25rem] lg:text-[1.5rem] ${titleText} flex items-center gap-2.5`}>
            <Layers className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>{t('3-Year Soil Organic Matter Projection', '৩ বছরে মাটির জৈব পদার্থের (SOM) পরিবর্তন')}</span>
          </h2>
          <Legend />

          <SomChart rec={recSom} trad={tradSom} years={years} />

          <div className="grid grid-cols-2 gap-3">
            <SubCard className="p-3.5 rounded-2xl text-center">
              <span className="text-xs block text-slate-600 dark:text-slate-400">{t('Recommended, year 3', 'প্রস্তাবিত, ৩য় বছর')}</span>
              <span className="fs-display text-[1.75rem] block my-1 text-sky-700 dark:text-sky-300">{n(recSom[3], 2)}%</span>
              <span className={`text-xs block font-medium ${recSom[3] >= recSom[0] ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-500'}`}>
                {somDelta(recSom)} SOM
              </span>
            </SubCard>
            <SubCard className="p-3.5 rounded-2xl text-center">
              <span className="text-xs block text-slate-600 dark:text-slate-400">{t('Current practice, year 3', 'প্রচলিত, ৩য় বছর')}</span>
              <span className="fs-display text-[1.75rem] block my-1 text-amber-700 dark:text-amber-400">{n(tradSom[3], 2)}%</span>
              <span className={`text-xs block font-medium ${tradSom[3] >= tradSom[0] ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-500'}`}>
                {somDelta(tradSom)} SOM
              </span>
            </SubCard>
          </div>

          <p className="text-sm leading-relaxed p-3.5 rounded-2xl glass-subtle">
            {t(`Starting from ${farm.organicMatter}% organic matter (set in Farm & Soil Profile) in ${district.name}. Legumes and crop residue raise soil carbon; repeated rice lowers it. Estimates only — confirm with a soil test every 1–2 years.`,
               `${district.nameBn} জেলায় বর্তমান জৈব পদার্থ ${farm.organicMatter}% (খামার ও মাটির তথ্য থেকে)। ডাল ফসল ও ফসলের অবশিষ্টাংশ মাটির কার্বন বাড়ায়; বারবার ধান চাষে কমে। এটি অনুমান মাত্র — প্রতি ১–২ বছরে মাটি পরীক্ষা করুন।`)}
          </p>
        </Card>
      </div>
    </div>
  );
}

function Legend() {
  const { t } = useApp();
  return (
    <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
      <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-sky-500" />{t('Recommended', 'প্রস্তাবিত')}</span>
      <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-500" />{t('Current practice', 'প্রচলিত')}</span>
    </div>
  );
}

/** Grouped bar chart with a % axis. Tap or hover a year to see both values. */
function SomChart({ rec, trad, years }: { rec: number[]; trad: number[]; years: string[] }) {
  const { t, n } = useApp();
  const [active, setActive] = useState<number | null>(null);

  // Round the axis top up to the next 0.5% so gridlines land on tidy numbers.
  const top = Math.max(1, Math.ceil(Math.max(...rec, ...trad) * 2) / 2);
  const ticks = [top, top / 2, 0];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {/* Y axis */}
        <div className="flex flex-col justify-between h-48 text-xs text-slate-500 dark:text-slate-400 text-right w-10 shrink-0 -mt-2 pb-0">
          {ticks.map(v => <span key={v}>{n(v, 1)}%</span>)}
        </div>

        <div className="relative flex-1 h-48">
          {/* Gridlines */}
          {ticks.map((v, i) => (
            <div key={v} className={`absolute left-0 right-0 border-t ${i === ticks.length - 1 ? 'border-slate-400/60' : 'border-dashed border-slate-400/25'}`}
                 style={{ top: `${(i / (ticks.length - 1)) * 100}%` }} />
          ))}

          <div className="absolute inset-0 flex items-end justify-around gap-2"
               role="img"
               aria-label={t(`Organic matter after 3 years: ${rec[3]}% recommended, ${trad[3]}% current practice`,
                             `৩ বছর পর জৈব পদার্থ: প্রস্তাবিত ${rec[3]}%, প্রচলিত ${trad[3]}%`)}>
            {years.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => setActive(a => (a === i ? null : i))}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                aria-label={`${label}: ${n(rec[i], 2)}% / ${n(trad[i], 2)}%`}
                className={`relative flex-1 h-full flex items-end justify-center gap-1 rounded-lg transition-colors ${active === i ? 'bg-sky-500/10' : ''}`}
              >
                <Bar value={rec[i]} max={top} className="bg-sky-500" />
                <Bar value={trad[i]} max={top} className="bg-amber-500/80" />
                {active === i && (
                  <span className="card-popup absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium glass-strong text-left">
                    <span className="block text-slate-500 dark:text-slate-400">{label}</span>
                    <span className="block text-sky-600 dark:text-sky-300">{t('Recommended', 'প্রস্তাবিত')}: {n(rec[i], 2)}%</span>
                    <span className="block text-amber-600 dark:text-amber-400">{t('Current', 'প্রচলিত')}: {n(trad[i], 2)}%</span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* X axis labels */}
      <div className="flex gap-2">
        <div className="w-10 shrink-0" />
        <div className="flex-1 flex justify-around gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          {years.map(l => <span key={l} className="flex-1 text-center">{l}</span>)}
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{t('Tap a year to see exact values.', 'সঠিক মান দেখতে একটি বছরে চাপুন।')}</p>
    </div>
  );
}

function Bar({ value, max, className }: { value: number; max: number; className: string }) {
  const { n } = useApp();
  return (
    <div className="w-1/3 max-w-[32px] flex flex-col items-center justify-end h-full">
      <span className="text-xs font-medium mb-0.5 hidden sm:block">{n(value, 1)}</span>
      <div className={`w-full rounded-t-md transition-all duration-500 ${className}`} style={{ height: `${(value / max) * 100}%` }} />
    </div>
  );
}
