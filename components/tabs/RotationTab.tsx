'use client';

import React from 'react';
import {
  AlertTriangle, Droplets, Info, Layers, RotateCcw, ShieldCheck, Sparkles, Sprout,
  TrendingDown, TrendingUp, type LucideIcon,
} from 'lucide-react';
import { getCrop } from '@/lib/metrics';
import { pick, signed } from '@/lib/i18n';
import { BIGHA_HA } from '@/lib/options';
import { useApp } from '../AppProvider';
import { Card, SubCard, ghostBtn, mutedText, titleText } from '../ui';
import { CropIcon, CropPicker } from '../CropIcon';
import { LEVEL_LABEL, LEVEL_STYLE, RISK_LABEL } from './NasaTab';

export default function RotationTab() {
  const {
    t, n, lang, district, farm, recommendation, recommendedPlan, isCustomPlan, setRecommendedCrop,
    resetRecommendedPlan, traditionalPlan, setTraditionalCrop, resetTraditionalPlan, tradMetrics, recMetrics, climateSource, climate,
  } = useApp();
  // Medium and high risks right now, from the predict-risk function.
  const alerts = (climate?.predictions ?? []).filter(p => p.level !== 'low');

  const waterSaved = tradMetrics.totalWaterMm - recMetrics.totalWaterMm;
  const waterSavedPct = tradMetrics.totalWaterMm > 0 ? Math.round((waterSaved / tradMetrics.totalWaterMm) * 100) : 0;
  const nGain = recMetrics.netNitrogen - tradMetrics.netNitrogen;
  const ureaSavedKg = Math.max(0, Math.round((nGain * farm.sizeBigha * BIGHA_HA) / 0.46));

  return (
    <div className="space-y-6 card-rise">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        <StatCard
          icon={Sprout} color="sky" label={t('Soil Health Index', 'মাটির স্বাস্থ্য স্কোর')}
          value={`${n(recMetrics.soilScore)}/${n(100)}`} delta={recMetrics.soilScore - tradMetrics.soilScore}
          note={`${t('Current practice:', 'প্রচলিত ধারায়:')} ${n(tradMetrics.soilScore)}/${n(100)}`}
        />
        <StatCard
          icon={Droplets} color="cyan" label={t('Annual Water Savings', 'সেচের পানি সাশ্রয়')}
          value={`${n(waterSaved)} ${t('mm', 'মিমি')}`} deltaText={`${n(waterSavedPct)}%`} delta={waterSaved}
          note={t('Less groundwater pumping per year', 'বছরে কম ভূগর্ভস্থ পানি উত্তোলন')}
        />
        <StatCard
          icon={Layers} color="indigo" label={t('Nitrogen Balance', 'প্রাকৃতিক নাইট্রোজেন সঞ্চয়')}
          value={`${signed(recMetrics.netNitrogen, 0, lang)} ${t('kg/ha', 'কেজি/হে.')}`}
          note={ureaSavedKg > 0
            ? t(`~${ureaSavedKg} kg less urea on your ${farm.sizeBigha} bigha`, `আপনার ${farm.sizeBigha} বিঘায় ~${ureaSavedKg} কেজি কম ইউরিয়া`)
            : t('No urea saving vs current practice', 'প্রচলিত ধারার তুলনায় ইউরিয়া সাশ্রয় নেই')}
        />
        <StatCard
          icon={ShieldCheck} color="teal" label={t('Climate Resilience', 'খরা ও তাপদাহ সহনশীলতা')}
          value={`${n(recMetrics.yieldResilience)}%`} delta={recMetrics.yieldResilience - tradMetrics.yieldResilience} deltaSuffix="%"
          note={t('Model estimate', 'মডেল ভিত্তিক অনুমান')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended */}
        <Card className="p-4 sm:p-5 rounded-4xl border-2 border-sky-500/40 space-y-4">
          <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-300"><Sparkles className="h-5 w-5" /></span>
              <div>
                <h3 className={`font-extrabold text-sm lg:text-base ${titleText}`}>
                  {t('Climate-Adaptive Recommended Rotation', 'জলবায়ু সহনশীল প্রস্তাবিত ফসল পর্যায়ক্রম')}
                </h3>
                <p className="text-xs font-medium text-sky-600 dark:text-sky-300">
                  {climateSource === 'nasa'
                    ? t(`Calibrated for ${district.name} with NASA POWER climate data`, `নাসা POWER জলবায়ু তথ্য দিয়ে ${district.nameBn} জেলার জন্য সাজানো`)
                    : t(`Calibrated for ${district.name} with the district baseline (NASA data not loaded)`, `জেলার মূল তথ্য দিয়ে ${district.nameBn} জেলার জন্য সাজানো (নাসার তথ্য লোড হয়নি)`)}
                </p>
                {alerts.length > 0 && (
                  <ul className="mt-1.5 flex flex-wrap gap-1.5" aria-label={t('Current risks from NASA data', 'নাসা তথ্য অনুযায়ী বর্তমান ঝুঁকি')}>
                    {alerts.map(p => (
                      <li key={p.kind} className={`text-xs font-bold px-2 py-0.5 rounded-full border ${LEVEL_STYLE[p.level]}`}>
                        {t(...RISK_LABEL[p.kind])}: {t(...LEVEL_LABEL[p.level])}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {isCustomPlan ? (
              <button type="button" onClick={resetRecommendedPlan} className={ghostBtn}>
                <RotateCcw className="h-3.5 w-3.5" />{t('Reset', 'রিসেট')}
              </button>
            ) : (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25 whitespace-nowrap">
                {t('Top Recommendation', 'সর্বোত্তম পরামর্শ')}
              </span>
            )}
          </div>

          <PlanList plan={recommendedPlan} onChange={setRecommendedCrop} variant="rec" />

          <SubCard className="p-4 rounded-2xl text-sm space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-sky-600 dark:text-sky-300">
              <Info className="h-4 w-4" />
              <span>{t('Why this sequence?', 'কেন এই ফসল বিন্যাস?')}</span>
            </div>
            {isCustomPlan ? (
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {t('You have edited this plan. Scores above reflect your changes. Press Reset to go back to the recommended sequence.',
                   'আপনি পরিকল্পনাটি পরিবর্তন করেছেন। উপরের স্কোর আপনার পরিবর্তন অনুযায়ী। প্রস্তাবিত বিন্যাসে ফিরতে রিসেট চাপুন।')}
              </p>
            ) : (
              <ol className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 list-decimal pl-4 space-y-1">
                {recommendation.reasons.map((r, i) => <li key={i}>{pick(lang, r)}</li>)}
                {waterSaved > 0 && (
                  <li>{t(`Cuts water demand by ${waterSaved.toLocaleString()} mm a year compared with the current plan.`,
                         `প্রচলিত পরিকল্পনার তুলনায় বছরে ${waterSaved.toLocaleString('en-US')} মিমি পানির চাহিদা কমায়।`)}</li>
                )}
              </ol>
            )}
          </SubCard>
        </Card>

        {/* Traditional */}
        <Card className="p-4 sm:p-5 rounded-4xl space-y-4">
          <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/15 text-amber-500"><AlertTriangle className="h-5 w-5" /></span>
              <div>
                <h3 className={`font-extrabold text-sm lg:text-base ${titleText}`}>
                  {t('Current Practice', 'কৃষকের প্রচলিত প্রথা')}
                </h3>
                <p className={`text-xs ${mutedText}`}>
                  {t('Set this to what you grow today to compare', 'তুলনার জন্য আপনি এখন যা চাষ করেন তা বেছে নিন')}
                </p>
              </div>
            </div>
            <button type="button" onClick={resetTraditionalPlan} className={ghostBtn}>
              <RotateCcw className="h-3.5 w-3.5" />{t('Reset', 'রিসেট')}
            </button>
          </div>

          <PlanList plan={traditionalPlan} onChange={setTraditionalCrop} variant="trad" />

          <SubCard className="p-4 rounded-2xl text-sm space-y-1.5 border border-amber-500/20">
            <div className="font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span>{t('Vulnerability Assessment', 'ঝুঁকি মূল্যায়ন')}</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {traditionalPlan.filter(id => id.startsWith('rice')).length >= 3
                ? t('Continuous paddy creates a hard plough pan, limits subsoil air and drains the water table faster each dry season.',
                    'ক্রমাগত ধান চাষে মাটির নিচে শক্ত স্তর তৈরি হয়, যা শিকড় চলাচলে বাধা দেয় এবং প্রতি শুষ্ক মৌসুমে পানির স্তর দ্রুত নামায়।')
                : t(`Water stress ${tradMetrics.waterStress}/100 and soil health ${tradMetrics.soilScore}/100 for this plan in ${district.name}.`,
                    `${district.nameBn} জেলায় এই পরিকল্পনায় পানির চাপ ${tradMetrics.waterStress}/100 এবং মাটির স্বাস্থ্য ${tradMetrics.soilScore}/100।`)}
            </p>
          </SubCard>
        </Card>
      </div>
    </div>
  );
}

const COLORS = {
  sky: { text: 'text-sky-600 dark:text-sky-300', bar: 'bg-sky-500', icon: 'text-sky-500' },
  cyan: { text: 'text-cyan-600 dark:text-cyan-300', bar: 'bg-cyan-500', icon: 'text-cyan-500' },
  indigo: { text: 'text-indigo-600 dark:text-indigo-300', bar: 'bg-indigo-500', icon: 'text-indigo-500' },
  teal: { text: 'text-teal-600 dark:text-teal-300', bar: 'bg-teal-500', icon: 'text-teal-500' },
};

function StatCard({
  icon: Icon, color, label, value, delta, deltaText, deltaSuffix = '', note,
}: {
  icon: LucideIcon; color: keyof typeof COLORS; label: string; value: string;
  delta?: number; deltaText?: string; deltaSuffix?: string; note: string;
}) {
  const { lang } = useApp();
  const c = COLORS[color];
  const up = (delta ?? 0) >= 0;
  return (
    <Card className="p-4 rounded-2xl relative overflow-hidden card-rise">
      <div className="flex items-start justify-between gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
        <span className="leading-snug">{label}</span>
        <Icon className={`h-5 w-5 shrink-0 ${c.icon}`} />
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
        <span className={`text-xl sm:text-2xl lg:text-3xl font-black ${c.text}`}>{value}</span>
        {delta !== undefined && (
          <span className={`text-sm font-bold flex items-center ${up ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-500'}`}>
            {up ? <TrendingUp className="h-4 w-4 mr-0.5" /> : <TrendingDown className="h-4 w-4 mr-0.5" />}
            {deltaText ?? `${signed(delta, 0, lang)}${deltaSuffix}`}
          </span>
        )}
      </div>
      <span className="block text-xs mt-1 leading-snug text-slate-500 dark:text-slate-400">{note}</span>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${c.bar}`} />
    </Card>
  );
}

function PlanList({ plan, onChange, variant }: { plan: string[]; onChange: (i: number, id: string) => void; variant: 'rec' | 'trad' }) {
  const { t, n, lang } = useApp();
  const rec = variant === 'rec';
  return (
    <ol className="space-y-3">
      {plan.map((cropId, idx) => {
        const crop = getCrop(cropId);
        return (
          <li key={idx} className="glass-subtle p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <CropIcon id={crop.id} size={48} />
                <span className={`absolute -top-1.5 -left-1.5 h-6 min-w-6 px-1 rounded-lg font-black text-xs flex items-center justify-center ${rec ? 'bg-sky-600 text-white' : 'bg-slate-500 text-white'}`}>
                  {t(`S${idx + 1}`, `${idx + 1}`)}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className={`font-bold text-sm lg:text-base ${titleText}`}>{lang === 'bn' ? crop.nameBn : crop.name}</h4>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${rec ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300' : 'bg-slate-400/20 text-slate-700 dark:text-slate-200'}`}>
                    {lang === 'bn' ? crop.categoryBn : crop.category}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs mt-1 text-slate-600 dark:text-slate-400">
                  <span>{t('Water:', 'পানি:')} <strong className={crop.waterMm > 600 ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-sky-300'}>{n(crop.waterMm)} {t('mm', 'মিমি')}</strong></span>
                  <span>{t('Nitrogen:', 'নাইট্রোজেন:')} <strong className={crop.nBalanceKgHa > 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-400'}>{signed(crop.nBalanceKgHa, 0, lang)} {t('kg', 'কেজি')}</strong></span>
                  <span>{t('Days:', 'দিন:')} <strong>{n(crop.growingPeriodDays)}</strong></span>
                </div>
              </div>
            </div>
            <CropPicker
              id={`${variant}-s${idx}`}
              value={cropId}
              onChange={(id) => onChange(idx, id)}
              label={t(`Crop for season ${idx + 1}`, `মৌসুম ${idx + 1} এর ফসল`)}
            />
          </li>
        );
      })}
    </ol>
  );
}
