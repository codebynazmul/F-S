'use client';

import React from 'react';
import {
  AlertTriangle, Droplets, Info, Layers, RotateCcw, ShieldCheck, Sparkles, Sprout,
  TrendingDown, TrendingUp, type LucideIcon,
} from 'lucide-react';
import { CROP_DATABASE } from '@/data/crops';
import { getCrop } from '@/lib/metrics';
import { pick, signed } from '@/lib/i18n';
import { BIGHA_HA } from '@/lib/options';
import { useApp } from '../AppProvider';
import { Card, SubCard, ghostBtn, mutedText, titleText } from '../ui';

export default function RotationTab() {
  const {
    t, lang, district, farm, recommendation, recommendedPlan, isCustomPlan, setRecommendedCrop,
    resetRecommendedPlan, traditionalPlan, setTraditionalCrop, resetTraditionalPlan, tradMetrics, recMetrics,
  } = useApp();

  const waterSaved = tradMetrics.totalWaterMm - recMetrics.totalWaterMm;
  const waterSavedPct = tradMetrics.totalWaterMm > 0 ? Math.round((waterSaved / tradMetrics.totalWaterMm) * 100) : 0;
  const nGain = recMetrics.netNitrogen - tradMetrics.netNitrogen;
  const ureaSavedKg = Math.max(0, Math.round((nGain * farm.sizeBigha * BIGHA_HA) / 0.46));

  return (
    <div className="space-y-6 card-rise">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        <StatCard
          icon={Sprout} color="sky" label={t('Soil Health Index', 'মাটির স্বাস্থ্য স্কোর')}
          value={`${recMetrics.soilScore}/100`} delta={recMetrics.soilScore - tradMetrics.soilScore}
          note={`${t('Current practice:', 'প্রচলিত ধারায়:')} ${tradMetrics.soilScore}/100`}
        />
        <StatCard
          icon={Droplets} color="cyan" label={t('Annual Water Savings', 'সেচের পানি সাশ্রয়')}
          value={`${waterSaved.toLocaleString()} mm`} deltaText={`${waterSavedPct}%`} delta={waterSaved}
          note={t('Less groundwater pumping per year', 'বছরে কম ভূগর্ভস্থ পানি উত্তোলন')}
        />
        <StatCard
          icon={Layers} color="indigo" label={t('Nitrogen Balance', 'প্রাকৃতিক নাইট্রোজেন সঞ্চয়')}
          value={`${signed(recMetrics.netNitrogen)} kg/ha`}
          note={ureaSavedKg > 0
            ? t(`~${ureaSavedKg} kg less urea on your ${farm.sizeBigha} bigha`, `আপনার ${farm.sizeBigha} বিঘায় ~${ureaSavedKg} কেজি কম ইউরিয়া`)
            : t('No urea saving vs current practice', 'প্রচলিত ধারার তুলনায় ইউরিয়া সাশ্রয় নেই')}
        />
        <StatCard
          icon={ShieldCheck} color="teal" label={t('Climate Resilience', 'খরা ও তাপদাহ সহনশীলতা')}
          value={`${recMetrics.yieldResilience}%`} delta={recMetrics.yieldResilience - tradMetrics.yieldResilience} deltaSuffix="%"
          note={t('Model estimate', 'মডেল ভিত্তিক অনুমান')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended */}
        <Card className="p-5 rounded-4xl border-2 border-sky-500/40 shadow-xl space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-300"><Sparkles className="h-5 w-5" /></span>
              <div>
                <h3 className={`font-extrabold text-sm lg:text-base ${titleText}`}>
                  {t('Climate-Adaptive Recommended Rotation', 'জলবায়ু সহনশীল প্রস্তাবিত ফসল পর্যায়ক্রম')}
                </h3>
                <p className="text-xs font-medium text-sky-600 dark:text-sky-300">
                  {t(`Calibrated for ${district.name} agro-ecology`, `${district.nameBn} জেলার মাটির জন্য বিশেষভাবে সাজানো`)}
                </p>
              </div>
            </div>
            {isCustomPlan ? (
              <button type="button" onClick={resetRecommendedPlan} className={ghostBtn}>
                <RotateCcw className="h-3.5 w-3.5" />{t('Reset', 'রিসেট')}
              </button>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25 whitespace-nowrap">
                {t('Top Recommendation', 'সর্বোত্তম পরামর্শ')}
              </span>
            )}
          </div>

          <PlanList plan={recommendedPlan} onChange={setRecommendedCrop} variant="rec" />

          <SubCard className="p-4 rounded-2xl text-xs space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-sky-600 dark:text-sky-300">
              <Info className="h-4 w-4" />
              <span>{t('Why this sequence?', 'কেন এই ফসল বিন্যাস?')}</span>
            </div>
            {isCustomPlan ? (
              <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                {t('You have edited this plan. Scores above reflect your changes. Press Reset to go back to the recommended sequence.',
                   'আপনি পরিকল্পনাটি পরিবর্তন করেছেন। উপরের স্কোর আপনার পরিবর্তন অনুযায়ী। প্রস্তাবিত বিন্যাসে ফিরতে রিসেট চাপুন।')}
              </p>
            ) : (
              <ol className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 list-decimal pl-4 space-y-1">
                {recommendation.reasons.map((r, i) => <li key={i}>{pick(lang, r)}</li>)}
                {waterSaved > 0 && (
                  <li>{t(`Cuts water demand by ${waterSaved.toLocaleString()} mm a year compared with the current plan.`,
                         `প্রচলিত পরিকল্পনার তুলনায় বছরে ${waterSaved.toLocaleString()} মিমি পানির চাহিদা কমায়।`)}</li>
                )}
              </ol>
            )}
          </SubCard>
        </Card>

        {/* Traditional */}
        <Card className="p-5 rounded-4xl shadow-xl space-y-4">
          <div className="flex items-start justify-between gap-3">
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

          <SubCard className="p-4 rounded-2xl text-xs space-y-1.5 border border-amber-500/20">
            <div className="font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span>{t('Vulnerability Assessment', 'ঝুঁকি মূল্যায়ন')}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
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
  const c = COLORS[color];
  const up = (delta ?? 0) >= 0;
  return (
    <Card className="p-4 rounded-2xl relative overflow-hidden card-rise">
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        <span>{label}</span>
        <Icon className={`h-4 w-4 ${c.icon}`} />
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
        <span className={`text-2xl lg:text-3xl font-black ${c.text}`}>{value}</span>
        {delta !== undefined && (
          <span className={`text-xs font-bold flex items-center ${up ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-500'}`}>
            {up ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
            {deltaText ?? `${signed(delta)}${deltaSuffix}`}
          </span>
        )}
      </div>
      <span className="text-[10px] text-slate-600 dark:text-slate-400">{note}</span>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${c.bar}`} />
    </Card>
  );
}

function PlanList({ plan, onChange, variant }: { plan: string[]; onChange: (i: number, id: string) => void; variant: 'rec' | 'trad' }) {
  const { t, lang } = useApp();
  const rec = variant === 'rec';
  return (
    <ol className="space-y-3">
      {plan.map((cropId, idx) => {
        const crop = getCrop(cropId);
        return (
          <li key={idx} className="glass-subtle p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`h-7 w-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${rec ? 'bg-sky-600 text-white' : 'bg-slate-400/30 text-slate-700 dark:text-slate-200'}`}>
                {`S${idx + 1}`}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className={`font-bold text-xs lg:text-sm ${titleText}`}>{lang === 'bn' ? crop.nameBn : crop.name}</h4>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${rec ? 'bg-sky-500/10 text-sky-600 dark:text-sky-300' : 'bg-slate-400/20 text-slate-700 dark:text-slate-200'}`}>
                    {lang === 'bn' ? crop.categoryBn : crop.category}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] mt-1 text-slate-600 dark:text-slate-400">
                  <span>{t('Water:', 'পানি:')} <strong className={crop.waterMm > 600 ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-sky-300'}>{crop.waterMm}mm</strong></span>
                  <span>{t('Nitrogen:', 'নাইট্রোজেন:')} <strong className={crop.nBalanceKgHa > 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-400'}>{signed(crop.nBalanceKgHa)} kg</strong></span>
                  <span>{t('Days:', 'দিন:')} <strong>{crop.growingPeriodDays}</strong></span>
                </div>
              </div>
            </div>
            <label className="sr-only" htmlFor={`${variant}-s${idx}`}>{t(`Crop for season ${idx + 1}`, `মৌসুম ${idx + 1} এর ফসল`)}</label>
            <select
              id={`${variant}-s${idx}`}
              value={cropId}
              onChange={(e) => onChange(idx, e.target.value)}
              className="text-xs rounded-xl px-2 py-1.5 border outline-none cursor-pointer glass-subtle border-sky-500/15 text-slate-800 dark:text-slate-100 no-print"
            >
              {Object.values(CROP_DATABASE).map(c => (
                <option key={c.id} value={c.id}>{lang === 'bn' ? c.nameBn : c.name}</option>
              ))}
            </select>
          </li>
        );
      })}
    </ol>
  );
}
