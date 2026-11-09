'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Droplets, RefreshCw, Sliders, Sparkles, Sun, Zap, type LucideIcon } from 'lucide-react';
import type { PlanMetrics } from '@/lib/metrics';
import { IRRIGATION_TYPES } from '@/lib/options';
import { DEFAULT_SIM, useApp } from '../AppProvider';
import { Card, Meter, SubCard, TabHeader, ghostBtn } from '../ui';

const PRESETS = [
  { en: 'Severe drought', bn: 'তীব্র খরা', sim: { rainDelta: -40, tempDelta: 2, irrigationCut: 60 } },
  { en: 'Heatwave', bn: 'তাপপ্রবাহ', sim: { rainDelta: -10, tempDelta: 3.5, irrigationCut: 20 } },
  { en: 'Flood year', bn: 'বন্যার বছর', sim: { rainDelta: 40, tempDelta: 0.5, irrigationCut: 0 } },
  { en: 'Normal year', bn: 'স্বাভাবিক বছর', sim: { rainDelta: 0, tempDelta: 0, irrigationCut: 0 } },
];

export default function WhatIfTab() {
  const { t, n, d, lang, sim, setSim, simRecMetrics, simTradMetrics, farm } = useApp();
  const isPreset = (p: typeof PRESETS[number]['sim']) =>
    p.rainDelta === sim.rainDelta && p.tempDelta === sim.tempDelta && p.irrigationCut === sim.irrigationCut;
  const irrigation = IRRIGATION_TYPES.find(i => i.id === farm.irrigation);

  const resilienceGap = simRecMetrics.yieldResilience - simTradMetrics.yieldResilience;

  return (
    <div className="space-y-6 card-rise">
      <Card className="p-6 rounded-[var(--radius-card)] space-y-6">
        <TabHeader
          icon={Sliders}
          title={t('What-If Climate Simulator', 'হোয়াট-ইফ জলবায়ু সিমুলেটর')}
          description={t('Test how both plans hold up under drought, heat and water rationing.',
                         'বৃষ্টিপাত কমলে বা তাপমাত্রা বাড়লে আপনার ফসল টিকবে কিনা তা আগেই পরীক্ষা করে দেখুন।')}
          actions={
            <button type="button" onClick={() => setSim(DEFAULT_SIM)} className={ghostBtn}>
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{t('Reset Sliders', 'রিসেট করুন')}</span>
            </button>
          }
        />

        <div className="space-y-2">
          <span className="text-sm font-medium block text-slate-700 dark:text-slate-300">{t('Quick scenarios', 'দ্রুত পরিস্থিতি')}</span>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            {PRESETS.map(p => {
              const active = isPreset(p.sim);
              return (
                <button
                  key={p.en}
                  type="button"
                  onClick={() => setSim(p.sim)}
                  aria-pressed={active}
                  className={`btn-popup min-h-tap px-4 py-2 rounded-full text-sm font-medium border ${
                    active ? 'bg-sky-600 text-white border-sky-600' : 'border-sky-500/25 glass-subtle text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {lang === 'bn' ? p.bn : p.en}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Slider
            id="sim-rain" icon={Droplets} iconColor="text-cyan-500"
            label={t('Rainfall Change', 'বৃষ্টিপাত পরিবর্তন')}
            value={sim.rainDelta} min={-40} max={40} step={5}
            display={d(`${sim.rainDelta > 0 ? '+' : sim.rainDelta < 0 ? '−' : ''}${Math.abs(sim.rainDelta)}% ${t('rain', 'বৃষ্টি')}`)}
            badge={sim.rainDelta < 0 ? 'bg-red-500/15 text-red-600 dark:text-red-400' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'}
            scale={[t('−40% (Drought)', '−৪০% (খরা)'), d('0%'), t('+40% (Flood)', '+৪০% (অতিবৃষ্টি)')]}
            onChange={(v) => setSim(s => ({ ...s, rainDelta: v }))}
          />
          <Slider
            id="sim-temp" icon={Sun} iconColor="text-amber-500"
            label={t('Temperature Rise', 'তাপমাত্রা বৃদ্ধি')}
            value={sim.tempDelta} min={0} max={4} step={0.5}
            display={d(`+${sim.tempDelta}°C`)}
            badge="bg-amber-500/15 text-amber-600 dark:text-amber-400"
            scale={[d('0°C'), d('+2°C'), d('+4°C')]}
            onChange={(v) => setSim(s => ({ ...s, tempDelta: v }))}
          />
          <Slider
            id="sim-irr" icon={Zap} iconColor="text-sky-500"
            label={t('Irrigation Cut', 'সেচ সীমাবদ্ধতা')}
            value={sim.irrigationCut} min={0} max={80} step={5}
            display={d(`−${sim.irrigationCut}% ${t('water', 'পানি')}`)}
            badge="bg-sky-500/15 text-sky-600 dark:text-sky-300"
            scale={[d('0%'), d('−40%'), d('−80%')]}
            onChange={(v) => setSim(s => ({ ...s, irrigationCut: v }))}
          />
        </div>

        {irrigation && irrigation.supplyCut > 0 && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t(`Your farm uses ${irrigation.en.toLowerCase()}, which already adds about ${irrigation.supplyCut}% supply risk.`,
               `আপনার খামারে ${irrigation.bn} ব্যবহার হয়, যা প্রায় ${irrigation.supplyCut}% অতিরিক্ত সেচ ঝুঁকি যোগ করে।`)}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResultCard title={t('Recommended Plan (Simulated)', 'প্রস্তাবিত পরিকল্পনা সিমুলেশন')} icon={Sparkles} tone="sky" m={simRecMetrics} />
          <ResultCard title={t('Current Practice (Simulated)', 'প্রচলিত পরিকল্পনা সিমুলেশন')} icon={AlertTriangle} tone="amber" m={simTradMetrics} />
        </div>

        <SubCard className={`p-4 rounded-2xl text-sm leading-relaxed flex items-start gap-2 ${resilienceGap >= 0 ? 'border border-emerald-500/30' : 'border border-amber-500/30'}`}>
          {resilienceGap >= 0
            ? <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300 shrink-0" />
            : <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />}
          <span>
            {resilienceGap >= 0
              ? t(`Under these conditions the recommended plan is ${resilienceGap} points more resilient and needs ${simTradMetrics.totalWaterMm - simRecMetrics.totalWaterMm} mm less water.`,
                  `এই অবস্থায় প্রস্তাবিত পরিকল্পনা ${resilienceGap} পয়েন্ট বেশি সহনশীল এবং ${simTradMetrics.totalWaterMm - simRecMetrics.totalWaterMm} মিমি কম পানি লাগে।`)
              : t('Under these conditions your current practice scores higher. Review the recommended crops for this district.',
                  'এই অবস্থায় প্রচলিত পরিকল্পনা বেশি স্কোর করছে। এই জেলার জন্য প্রস্তাবিত ফসলগুলো পুনরায় দেখুন।')}
          </span>
        </SubCard>
      </Card>
    </div>
  );

  function ResultCard({ title, icon: Icon, tone, m }: { title: string; icon: LucideIcon; tone: 'sky' | 'amber'; m: PlanMetrics }) {
    const head = tone === 'sky' ? 'text-sky-600 dark:text-sky-300' : 'text-amber-600 dark:text-amber-400';
    const rows = [
      { label: t('Soil Score', 'মাটির স্কোর'), value: m.soilScore, color: 'bg-sky-500' },
      { label: t('Water Stress (lower is better)', 'পানির চাপ (কম হলে ভালো)'), value: m.waterStress, color: m.waterStress > 60 ? 'bg-red-500' : m.waterStress > 30 ? 'bg-amber-500' : 'bg-emerald-500' },
      { label: t('Yield Resilience', 'ফলন সহনশীলতা'), value: m.yieldResilience, color: 'bg-teal-500' },
    ];
    return (
      <SubCard className="p-5 rounded-2xl space-y-3">
        <h3 className={`text-sm font-semibold flex items-center gap-2 ${head}`}>
          <Icon className="h-4 w-4" />{title}
        </h3>
        <div className="space-y-3 text-sm">
          {rows.map(r => (
            <div key={r.label} className="space-y-1">
              <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">{r.label}</span><strong>{n(r.value)}/{n(100)}</strong></div>
              <Meter value={r.value} color={r.color} label={r.label} />
            </div>
          ))}
        </div>
      </SubCard>
    );
  }
}

function Slider({
  id, icon: Icon, iconColor, label, value, min, max, step, display, badge, scale, onChange,
}: {
  id: string; icon: LucideIcon; iconColor: string; label: string; value: number; min: number; max: number; step: number;
  display: string; badge: string; scale: string[]; onChange: (v: number) => void;
}) {
  return (
    <SubCard className="p-4 rounded-2xl space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium">
        <label htmlFor={id} className="flex items-center gap-1.5">
          <Icon className={`h-5 w-5 ${iconColor}`} />{label}
        </label>
        <span className={`px-2.5 py-1 rounded-lg text-sm font-semibold whitespace-nowrap ${badge}`} aria-hidden>{display}</span>
      </div>
      <input
        id={id} type="range" min={min} max={max} step={step} value={value}
        aria-valuetext={display}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
      />
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        {scale.map(s => <span key={s}>{s}</span>)}
      </div>
    </SubCard>
  );
}
