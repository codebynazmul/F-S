'use client';

import React from 'react';
import { BarChart3, Layers } from 'lucide-react';
import { performanceScores, projectOrganicMatter } from '@/lib/metrics';
import { useApp } from '../AppProvider';
import { Card, Meter, SubCard, titleText } from '../ui';

export default function AnalyticsTab() {
  const { t, lang, district, farm, recMetrics, tradMetrics } = useApp();

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
  const maxSom = Math.max(...recSom, ...tradSom, 2);

  return (
    <div className="space-y-6 card-rise">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-4xl space-y-4 shadow-xl">
          <h2 className={`font-black text-base ${titleText} flex items-center gap-2`}>
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            <span>{t('Rotation Performance Comparison', 'ফসল পর্যায়ক্রমের সার্বিক তুলনা')}</span>
          </h2>
          <Legend />

          <div className="space-y-4 pt-1">
            {rows.map(r => (
              <div key={r.key} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>{lang === 'bn' ? r.bn : r.en}</span>
                  <span className="text-[11px]">
                    <strong className="text-sky-600 dark:text-sky-300">{rec[r.key]}</strong>
                    <span className="text-slate-500"> vs </span>
                    <span className="text-amber-600 dark:text-amber-400">{trad[r.key]}</span>
                  </span>
                </div>
                <Meter value={rec[r.key]} color="bg-sky-500" label={`${r.en} recommended`} />
                <Meter value={trad[r.key]} color="bg-amber-500/80" label={`${r.en} current`} />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 dark:text-slate-400">
            {t('Scores are 0–100 from the Field Shift screening model for the selected district and your farm profile.',
               'স্কোর ০–১০০, নির্বাচিত জেলা ও আপনার খামারের তথ্যের ভিত্তিতে ফিল্ড শিফট মডেল থেকে হিসাব করা।')}
          </p>
        </Card>

        <Card className="p-6 rounded-4xl space-y-4 shadow-xl">
          <h2 className={`font-black text-base ${titleText} flex items-center gap-2`}>
            <Layers className="h-5 w-5 text-sky-500" />
            <span>{t('3-Year Soil Organic Matter Projection', '৩ বছরে মাটির জৈব পদার্থের (SOM) পরিবর্তন')}</span>
          </h2>
          <Legend />

          {/* Simple grouped bar chart */}
          <div className="flex items-end justify-between gap-3 h-44 pt-4" role="img"
               aria-label={t(`Organic matter after 3 years: ${recSom[3]}% recommended, ${tradSom[3]}% current practice`,
                             `৩ বছর পর জৈব পদার্থ: প্রস্তাবিত ${recSom[3]}%, প্রচলিত ${tradSom[3]}%`)}>
            {years.map((label, i) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="flex items-end gap-1 w-full justify-center h-full">
                  <Bar value={recSom[i]} max={maxSom} className="bg-sky-500" />
                  <Bar value={tradSom[i]} max={maxSom} className="bg-amber-500/80" />
                </div>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SubCard className="p-3.5 rounded-2xl text-center">
              <span className="text-[11px] block text-slate-600 dark:text-slate-400">{t('Recommended, year 3', 'প্রস্তাবিত, ৩য় বছর')}</span>
              <span className="text-xl font-black text-sky-600 dark:text-sky-300">{recSom[3].toFixed(2)}%</span>
              <span className={`text-[10px] block font-bold ${recSom[3] >= recSom[0] ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-500'}`}>
                {recSom[3] >= recSom[0] ? '+' : ''}{(recSom[3] - recSom[0]).toFixed(2)}% SOM
              </span>
            </SubCard>
            <SubCard className="p-3.5 rounded-2xl text-center">
              <span className="text-[11px] block text-slate-600 dark:text-slate-400">{t('Current practice, year 3', 'প্রচলিত, ৩য় বছর')}</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">{tradSom[3].toFixed(2)}%</span>
              <span className={`text-[10px] block font-bold ${tradSom[3] >= tradSom[0] ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-500'}`}>
                {tradSom[3] >= tradSom[0] ? '+' : ''}{(tradSom[3] - tradSom[0]).toFixed(2)}% SOM
              </span>
            </SubCard>
          </div>

          <p className="text-xs leading-relaxed p-3.5 rounded-2xl glass-subtle">
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
    <div className="flex flex-wrap gap-4 text-[11px] text-slate-600 dark:text-slate-300">
      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-500" />{t('Recommended', 'প্রস্তাবিত')}</span>
      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />{t('Current practice', 'প্রচলিত')}</span>
    </div>
  );
}

function Bar({ value, max, className }: { value: number; max: number; className: string }) {
  return (
    <div className="w-1/3 max-w-[28px] flex flex-col items-center justify-end h-full">
      <span className="text-[9px] font-bold mb-0.5">{value.toFixed(1)}</span>
      <div className={`w-full rounded-t-md transition-all duration-500 ${className}`} style={{ height: `${(value / max) * 100}%` }} />
    </div>
  );
}
