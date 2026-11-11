'use client';

import React from 'react';
import {
  AlertTriangle, Beef, CheckCircle2, Coins, ClipboardCheck, Droplets, Info, Layers, RotateCcw, Satellite, Scale, ShieldCheck,
  Sparkles, Sprout, Target, TrendingDown, TrendingUp, type LucideIcon,
} from 'lucide-react';
import { getCrop } from '@/lib/metrics';
import { pick, signed } from '@/lib/i18n';
import { BIGHA_HA, PRIORITIES } from '@/lib/options';
import { compareWithCurrent, type EvidenceSource, type RiskFlag, type Strategy } from '@/lib/recommend';
import type { Priority } from '@/lib/types';
import { useApp } from '../AppProvider';
import { Card, SubCard, TabHeader, ghostBtn, mutedText, titleText } from '../ui';
import { CropIcon, CropPicker } from '../CropIcon';
import { LEVEL_LABEL, LEVEL_STYLE, RISK_LABEL } from './NasaTab';

export default function RotationTab() {
  const {
    t, n, lang, district, farm, recommendation, recommendedPlan, isCustomPlan, setRecommendedCrop, chosenStrategy,
    resetRecommendedPlan, traditionalPlan, setTraditionalCrop, resetTraditionalPlan, tradMetrics, recMetrics, climateSource, climate,
  } = useApp();
  // Medium and high risks right now, from the predict-risk function.
  const alerts = (climate?.predictions ?? []).filter(p => p.level !== 'low');
  const best = recommendation.strategies[0];

  const waterSaved = tradMetrics.totalWaterMm - recMetrics.totalWaterMm;
  const waterSavedPct = tradMetrics.totalWaterMm > 0 ? Math.round((waterSaved / tradMetrics.totalWaterMm) * 100) : 0;
  const nGain = recMetrics.netNitrogen - tradMetrics.netNitrogen;
  const ureaSavedKg = Math.max(0, Math.round((nGain * farm.sizeBigha * BIGHA_HA) / 0.46));

  return (
    <div className="space-y-6 card-rise">
      <TabHeader
        icon={Sprout}
        badge={t(`Crop rotation · ${district.name}`, `ফসল পর্যায়ক্রম · ${district.nameBn}`)}
        title={t('Your crop rotation plan', 'আপনার ফসল পর্যায়ক্রম পরিকল্পনা')}
        description={t('Three seasons on the same field, ranked by what matters to you, compared with what you grow now.',
                       'একই জমিতে তিন মৌসুম, আপনার অগ্রাধিকার অনুযায়ী সাজানো, বর্তমান চাষের সাথে তুলনা করে।')}
      />

      <PriorityPicker />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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
          icon={Layers} color="emerald" label={t('Nitrogen Balance', 'প্রাকৃতিক নাইট্রোজেন সঞ্চয়')}
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

      <StrategyTable />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan in use */}
        <Card className="p-4 sm:p-6 rounded-[var(--radius-card)] !border-sky-600/40 space-y-4">
          <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="fs-icon-tile h-11 w-11 rounded-2xl"><Sparkles className="h-5 w-5" /></span>
              <div>
                <h3 className={`font-medium text-base lg:text-[1.0625rem] ${titleText}`}>
                  {chosenStrategy
                    ? `${t('Your plan:', 'আপনার পরিকল্পনা:')} ${pick(lang, chosenStrategy.name)}`
                    : t('Your plan (edited)', 'আপনার পরিকল্পনা (পরিবর্তিত)')}
                </h3>
                <p className="text-xs font-medium text-sky-600 dark:text-sky-300">
                  {climateSource === 'nasa'
                    ? t(`Calibrated for ${district.name} with NASA climate and satellite data`, `নাসার জলবায়ু ও স্যাটেলাইট তথ্য দিয়ে ${district.nameBn} জেলার জন্য সাজানো`)
                    : t(`Calibrated for ${district.name} with the district baseline (NASA data not loaded)`, `জেলার মূল তথ্য দিয়ে ${district.nameBn} জেলার জন্য সাজানো (নাসার তথ্য লোড হয়নি)`)}
                </p>
                {alerts.length > 0 && (
                  <ul className="mt-1.5 flex flex-wrap gap-1.5" aria-label={t('Current risks from NASA data', 'নাসা তথ্য অনুযায়ী বর্তমান ঝুঁকি')}>
                    {alerts.map(p => (
                      <li key={p.kind} className={`text-xs font-medium px-2 py-0.5 rounded-full border ${LEVEL_STYLE[p.level]}`}>
                        {t(...RISK_LABEL[p.kind])}: {t(...LEVEL_LABEL[p.level])}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {isCustomPlan ? (
              <button type="button" onClick={resetRecommendedPlan} className={ghostBtn}>
                <RotateCcw className="h-3.5 w-3.5" />{t('Back to best match', 'সেরা মিলে ফিরুন')}
              </button>
            ) : (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-harvest-300 text-harvest-900 whitespace-nowrap shadow-sm">
                {t('Best match', 'সেরা মিল')}
              </span>
            )}
          </div>

          <PlanList plan={recommendedPlan} onChange={setRecommendedCrop} variant="rec" />

          <SubCard className="p-4 rounded-2xl text-sm space-y-2">
            <div className="font-medium flex items-center gap-1.5 text-sky-600 dark:text-sky-300">
              <Info className="h-4 w-4" />
              <span>{t('Why this sequence?', 'কেন এই ফসল বিন্যাস?')}</span>
            </div>
            {chosenStrategy ? (
              <ol className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 list-decimal pl-4 space-y-1">
                {chosenStrategy.reasons.map((r, i) => <li key={i}>{pick(lang, r)}</li>)}
                {waterSaved > 0 && (
                  <li>{t(`Cuts water demand by ${waterSaved.toLocaleString()} mm a year compared with the current plan.`,
                         `প্রচলিত পরিকল্পনার তুলনায় বছরে ${waterSaved.toLocaleString('en-US')} মিমি পানির চাহিদা কমায়।`)}</li>
                )}
              </ol>
            ) : (
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {t('You have edited this plan. Scores above reflect your changes. Press "Back to best match" to use the top-ranked strategy, or pick another one in the table above.',
                   'আপনি পরিকল্পনাটি পরিবর্তন করেছেন। উপরের স্কোর আপনার পরিবর্তন অনুযায়ী। শীর্ষ কৌশলে ফিরতে "সেরা মিলে ফিরুন" চাপুন, অথবা উপরের তালিকা থেকে অন্য একটি বেছে নিন।')}
              </p>
            )}
            {best && chosenStrategy && chosenStrategy.id !== best.id && (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t(`For your priorities, "${best.name.en}" ranks higher (${best.match} vs ${chosenStrategy.match}).`,
                   `আপনার অগ্রাধিকার অনুযায়ী "${best.name.bn}" বেশি উপযোগী (${best.match} বনাম ${chosenStrategy.match})।`)}
              </p>
            )}
          </SubCard>
        </Card>

        {/* Traditional */}
        <Card className="p-4 sm:p-5 rounded-[var(--radius-card)] space-y-4">
          <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600"><AlertTriangle className="h-5 w-5" /></span>
              <div>
                <h3 className={`font-medium text-base lg:text-[1.0625rem] ${titleText}`}>
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
            <div className="font-medium flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
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

      <StrategyDetails />
      <EvidencePanel />
      <Disclaimer />
    </div>
  );
}

// ---------- Priorities ----------

/** An icon and colour per goal, so each choice is recognisable before reading. */
const PRIORITY_ICON: Record<Priority, LucideIcon> = { water: Droplets, soil: Layers, income: Coins, forage: Beef, resilience: ShieldCheck };
const PRIORITY_TILE: Record<Priority, string> = {
  water: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300',
  soil: 'bg-soil-100 text-soil-700 dark:bg-soil-500/25 dark:text-soil-200',
  income: 'bg-harvest-100 text-harvest-800 dark:bg-harvest-500/20 dark:text-harvest-200',
  forage: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  resilience: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
};
function PriorityIcon({ id }: { id: Priority }) {
  const Icon = PRIORITY_ICON[id];
  return <Icon className="h-[18px] w-[18px]" aria-hidden />;
}

function PriorityPicker() {
  const { t, lang, priorities, togglePriority } = useApp();
  return (
    <Card className="p-4 sm:p-5 rounded-[var(--radius-card)] space-y-3">
      <div>
        <h2 className={`fs-display text-[1.25rem] lg:text-[1.5rem] ${titleText} flex items-center gap-2.5`}>
          <span className="fs-icon-tile h-10 w-10 rounded-xl"><Target className="h-5 w-5" aria-hidden /></span>
          <span>{t('What matters most on your farm?', 'আপনার খামারে কোনটি সবচেয়ে জরুরি?')}</span>
        </h2>
        <p className={`text-sm mt-1 ${mutedText}`}>
          {t('Pick one or more. The rotation strategies below are ranked by your choice. With nothing picked, every goal counts the same.',
             'এক বা একাধিক বেছে নিন। নিচের কৌশলগুলো আপনার পছন্দ অনুযায়ী সাজানো হবে। কিছু না বাছলে সব লক্ষ্য সমান গুরুত্ব পায়।')}
        </p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('Your priorities', 'আপনার অগ্রাধিকার')}>
        {PRIORITIES.map(p => {
          const on = priorities.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={on}
              onClick={() => togglePriority(p.id)}
              className={`btn-popup min-h-[48px] pl-2 pr-4 py-1.5 rounded-full text-[0.9375rem] font-semibold border flex items-center gap-2 cursor-pointer ${
                on ? 'fs-btn-primary border-transparent' : 'border-sky-600/20 bg-[var(--bg-surface)] hover:border-sky-600/45 hover:bg-sky-600/[0.05] text-slate-800 dark:text-slate-100'
              }`}
            >
              <span className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${on ? 'bg-white/20' : PRIORITY_TILE[p.id]}`}>
                {on ? <CheckCircle2 className="h-[18px] w-[18px]" aria-hidden /> : <PriorityIcon id={p.id} />}
              </span>
              {lang === 'bn' ? p.bn : p.en}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

// ---------- Strategy comparison ----------

const SCORE_COLUMNS: { id: Priority; en: string; bn: string }[] = [
  { id: 'water', en: 'Water saving', bn: 'পানি সাশ্রয়' },
  { id: 'soil', en: 'Soil health', bn: 'মাটির স্বাস্থ্য' },
  { id: 'resilience', en: 'Climate resilience', bn: 'জলবায়ু সহনশীলতা' },
  { id: 'income', en: 'Income', bn: 'আয়' },
  { id: 'forage', en: 'Fodder', bn: 'পশুখাদ্য' },
];

const scoreColor = (v: number) =>
  v >= 70 ? 'text-emerald-700 dark:text-emerald-300' : v >= 45 ? 'text-slate-800 dark:text-slate-100' : 'text-amber-700 dark:text-amber-400';

function StrategyTable() {
  const { t, n, lang, recommendation, recommendedPlan, priorities, applyStrategy } = useApp();
  const rows: Strategy[] = [...recommendation.strategies, ...(recommendation.current ? [recommendation.current] : [])];
  const bestId = recommendation.strategies[0]?.id;
  const inUse = recommendedPlan.join();

  return (
    <Card className="p-4 sm:p-5 rounded-[var(--radius-card)] space-y-3">
      <div>
        <h2 className={`fs-display text-[1.25rem] lg:text-[1.5rem] ${titleText} flex items-center gap-2.5`}>
          <Scale className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
          <span>{t('Compare rotation strategies', 'ফসল পর্যায়ক্রমের কৌশল তুলনা')}</span>
        </h2>
        <p className={`text-sm mt-1 ${mutedText}`}>
          {t(`${rows.length} rotations for ${recommendation.current ? 'your farm, including what you grow now' : 'your farm'}. Scores are 0–100, higher is better. "Match" weighs the scores by your priorities and drops for crops that don't suit local risks.`,
             `আপনার খামারের জন্য ${rows.length}টি পর্যায়ক্রম${recommendation.current ? ', আপনার বর্তমান চাষসহ' : ''}। স্কোর ০–১০০, বেশি হলে ভালো। "মিল" আপনার অগ্রাধিকার অনুযায়ী স্কোর হিসাব করে, এবং স্থানীয় ঝুঁকিতে অনুপযুক্ত ফসল থাকলে কমে।`)}
        </p>
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full min-w-[720px] text-sm border-separate border-spacing-y-1.5">
          <thead>
            <tr className="text-xs text-left text-slate-600 dark:text-slate-400">
              <th scope="col" className="font-semibold px-2">{t('Strategy', 'কৌশল')}</th>
              <th scope="col" className="font-semibold px-2 text-center">{t('Match', 'মিল')}</th>
              {SCORE_COLUMNS.map(c => {
                const picked = priorities.includes(c.id);
                return (
                  <th key={c.id} scope="col" className={`px-2 text-center ${picked ? 'font-semibold text-sky-700 dark:text-sky-300' : 'font-semibold'}`}>
                    {lang === 'bn' ? c.bn : c.en}{picked && ' ★'}
                  </th>
                );
              })}
              <th scope="col" className="font-semibold px-2 text-center">{t('Water need', 'পানির চাহিদা')}</th>
              <th scope="col" className="px-2"><span className="sr-only">{t('Action', 'কাজ')}</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(s => {
              const current = s.id === 'current';
              const using = !current && s.plan.join() === inUse;
              return (
                <tr key={s.id} className={current ? 'bg-amber-500/10' : using ? 'bg-sky-500/10' : 'bg-slate-400/5'}>
                  <th scope="row" className="text-left font-normal p-2 rounded-l-xl align-middle">
                    <div className={`font-medium ${titleText} flex flex-wrap items-center gap-1.5`}>
                      {pick(lang, s.name)}
                      {s.id === bestId && (
                        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          {t('Best match', 'সেরা মিল')}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 mt-1" aria-label={s.plan.map(id => (lang === 'bn' ? getCrop(id).nameBn : getCrop(id).name)).join(', ')}>
                      {s.plan.map((id, i) => <CropIcon key={i} id={id} size={22} />)}
                    </div>
                  </th>
                  <td className="p-2 text-center align-middle">
                    {current ? <span className={mutedText}>{n(s.match)}</span> : <strong className="text-base text-sky-700 dark:text-sky-300">{n(s.match)}</strong>}
                  </td>
                  {SCORE_COLUMNS.map(c => (
                    <td key={c.id} className={`p-2 text-center align-middle font-medium ${scoreColor(s.scores[c.id])}`}>{n(s.scores[c.id])}</td>
                  ))}
                  <td className="p-2 text-center align-middle whitespace-nowrap">{n(s.metrics.totalWaterMm)} {t('mm', 'মিমি')}</td>
                  <td className="p-2 rounded-r-xl align-middle text-right">
                    {current ? (
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400 whitespace-nowrap">{t('What you grow now', 'বর্তমান চাষ')}</span>
                    ) : using ? (
                      <span className="text-xs font-medium text-sky-700 dark:text-sky-300 whitespace-nowrap flex items-center justify-end gap-1">
                        <CheckCircle2 className="h-4 w-4" />{t('In use', 'ব্যবহৃত')}
                      </span>
                    ) : (
                      <button type="button" onClick={() => applyStrategy(s.plan)} className={`${ghostBtn} ml-auto whitespace-nowrap`}>
                        {t('Use this plan', 'এটি ব্যবহার করুন')}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {recommendation.skipped.length > 0 && (
        <ul className={`text-xs space-y-1 ${mutedText}`}>
          {recommendation.skipped.map((s, i) => <li key={i}>• {pick(lang, s)}</li>)}
        </ul>
      )}
    </Card>
  );
}

// ---------- Why, benefits and checks ----------

function StrategyDetails() {
  const { t, lang, recommendation, recommendedPlan } = useApp();
  const rows: Strategy[] = [...recommendation.strategies, ...(recommendation.current ? [recommendation.current] : [])];
  const inUse = recommendedPlan.join();

  return (
    <Card className="p-4 sm:p-5 rounded-[var(--radius-card)] space-y-3">
      <h2 className={`fs-display text-[1.25rem] lg:text-[1.5rem] ${titleText} flex items-center gap-2.5`}>
        <ClipboardCheck className="h-5 w-5 text-teal-500 shrink-0" />
        <span>{t('Why each strategy, its benefits, and what to check', 'প্রতিটি কৌশল কেন, এর সুবিধা, এবং কী যাচাই করবেন')}</span>
      </h2>
      <div className="space-y-2">
        {rows.map(s => {
          const { gains, costs } = compareWithCurrent(s, recommendation.current);
          const open = s.id !== 'current' && s.plan.join() === inUse;
          return (
            <details key={s.id} open={open} className="glass-subtle rounded-2xl group">
              <summary className="min-h-tap cursor-pointer list-none p-3.5 flex items-center justify-between gap-3">
                <span className={`font-medium ${titleText}`}>{pick(lang, s.name)}</span>
                <span className="text-xs font-medium text-sky-600 dark:text-sky-300 group-open:hidden">{t('Show', 'দেখুন')}</span>
                <span className="text-xs font-medium text-sky-600 dark:text-sky-300 hidden group-open:inline">{t('Hide', 'লুকান')}</span>
              </summary>
              <div className="px-3.5 pb-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm leading-relaxed">
                <section className="space-y-1.5">
                  <h3 className="font-medium text-sky-700 dark:text-sky-300 flex items-center gap-1.5"><Info className="h-4 w-4" />{t('Why it was suggested', 'কেন প্রস্তাব করা হলো')}</h3>
                  <p className="text-slate-700 dark:text-slate-300">{pick(lang, s.summary)}</p>
                  {s.reasons.length > 0 && (
                    <ol className="list-decimal pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                      {s.reasons.map((r, i) => (
                        <li key={i}><strong>{lang === 'bn' ? getCrop(s.plan[i]).nameBn : getCrop(s.plan[i]).name}:</strong> {pick(lang, r)}</li>
                      ))}
                    </ol>
                  )}
                </section>
                <section className="space-y-1.5">
                  <h3 className="font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5"><TrendingUp className="h-4 w-4" />{t('Compared with what you grow now', 'বর্তমান চাষের তুলনায়')}</h3>
                  {s.id === 'current' ? (
                    <p className={mutedText}>{t('This is your current rotation, the baseline for the others.', 'এটি আপনার বর্তমান পর্যায়ক্রম, অন্যগুলোর তুলনার ভিত্তি।')}</p>
                  ) : gains.length + costs.length === 0 ? (
                    <p className={mutedText}>{t('About the same as your current rotation.', 'আপনার বর্তমান পর্যায়ক্রমের প্রায় সমান।')}</p>
                  ) : (
                    <ul className="space-y-1">
                      {gains.map((g, i) => <li key={`g${i}`} className="flex gap-1.5"><CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-300" /><span>{pick(lang, g)}</span></li>)}
                      {costs.map((c, i) => <li key={`c${i}`} className="flex gap-1.5"><TrendingDown className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" /><span>{pick(lang, c)}</span></li>)}
                    </ul>
                  )}
                </section>
                <section className="space-y-1.5">
                  <h3 className="font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" />{t('Check locally before using', 'ব্যবহারের আগে স্থানীয়ভাবে যাচাই করুন')}</h3>
                  {s.checks.length === 0 ? (
                    <p className={mutedText}>{t('No specific warnings. Still confirm with your agriculture officer.', 'নির্দিষ্ট কোনো সতর্কতা নেই। তবুও কৃষি কর্মকর্তার সাথে নিশ্চিত হন।')}</p>
                  ) : (
                    <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                      {s.checks.map((c, i) => <li key={i}>{pick(lang, c)}</li>)}
                    </ul>
                  )}
                </section>
              </div>
            </details>
          );
        })}
      </div>
    </Card>
  );
}

// ---------- Evidence and gaps ----------

const SOURCE_LABEL: Record<EvidenceSource, [string, string]> = {
  nasa_power: ['NASA POWER', 'নাসা POWER'],
  smap: ['NASA SMAP', 'নাসা SMAP'],
  modis: ['NASA MODIS', 'নাসা MODIS'],
  nasadem: ['NASADEM', 'NASADEM'],
  risk_model: ['Risk levels (NASA data)', 'ঝুঁকির মাত্রা (নাসা তথ্য)'],
  district: ['District profile', 'জেলার বিবরণ'],
  farm: ['Your farm profile', 'আপনার খামারের তথ্য'],
};

const FLAG_LABEL: Record<RiskFlag, [string, string]> = {
  drought: ['Drought', 'খরা'],
  flood: ['Flood / waterlogging', 'বন্যা / জলাবদ্ধতা'],
  heat: ['Heat', 'তাপ'],
  cold: ['Cool winter', 'ঠান্ডা শীত'],
  salinity: ['Salinity', 'লবণাক্ততা'],
  cropStress: ['Crop stress', 'ফসলের চাপ'],
};

function EvidencePanel() {
  const { t, lang, recommendation } = useApp();
  const raised = (Object.keys(recommendation.risks) as RiskFlag[]).filter(k => recommendation.risks[k]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-4 sm:p-5 rounded-[var(--radius-card)] space-y-3">
        <h2 className={`fs-display text-[1.25rem] lg:text-[1.5rem] ${titleText} flex items-center gap-2.5`}>
          <Satellite className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
          <span>{t('Evidence behind these suggestions', 'এই পরামর্শের পেছনের তথ্য')}</span>
        </h2>
        <p className={`text-sm ${mutedText}`}>
          {raised.length > 0
            ? `${t('Risks found:', 'পাওয়া ঝুঁকি:')} ${raised.map(k => t(...FLAG_LABEL[k])).join(', ')}.`
            : t('No major risks found in the data.', 'তথ্যে বড় কোনো ঝুঁকি পাওয়া যায়নি।')}
        </p>
        <ul className="space-y-2">
          {recommendation.evidence.map((e, i) => (
            <li key={i} className="glass-subtle rounded-xl p-3 text-sm space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300">{t(...SOURCE_LABEL[e.source])}</span>
                {e.raises.map(k => (
                  <span key={k} className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-200">
                    {t('Raises:', 'ঝুঁকি:')} {t(...FLAG_LABEL[k])}
                  </span>
                ))}
              </div>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">{pick(lang, e.text)}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-4 sm:p-5 rounded-[var(--radius-card)] space-y-3">
        <h2 className={`fs-display text-[1.25rem] lg:text-[1.5rem] ${titleText} flex items-center gap-2.5`}>
          <Info className="h-5 w-5 text-amber-500 shrink-0" />
          <span>{t('Information gaps', 'তথ্যের ঘাটতি')}</span>
        </h2>
        <p className={`text-sm ${mutedText}`}>
          {t('What this advice cannot see. These are the places where local knowledge matters most.',
             'এই পরামর্শ যা দেখতে পায় না। এখানেই স্থানীয় জ্ঞান সবচেয়ে বেশি দরকার।')}
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {recommendation.gaps.map((g, i) => <li key={i}>{pick(lang, g)}</li>)}
        </ul>
      </Card>
    </div>
  );
}

function Disclaimer() {
  const { t } = useApp();
  return (
    <SubCard className="p-4 rounded-2xl text-sm leading-relaxed flex items-start gap-2 border border-sky-500/25">
      <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-300 shrink-0 mt-0.5" />
      <span>
        {t('Agro Cosmic Weave helps you explore options. It does not replace your own experience or advice from your Upazila Agriculture Officer. Talk through the "Check locally" items with them before changing crops.',
           'অ্যাগ্রো কসমিক উইভ আপনাকে বিকল্পগুলো ভেবে দেখতে সাহায্য করে। এটি আপনার নিজের অভিজ্ঞতা বা উপজেলা কৃষি কর্মকর্তার পরামর্শের বিকল্প নয়। ফসল বদলানোর আগে "স্থানীয়ভাবে যাচাই করুন" অংশগুলো তাঁর সাথে আলোচনা করুন।')}
      </span>
    </SubCard>
  );
}

const COLORS = {
  sky: { text: 'text-sky-600 dark:text-sky-300', bar: 'bg-sky-500', tile: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300', wash: 'from-sky-500/[0.10]' },
  cyan: { text: 'text-cyan-600 dark:text-cyan-300', bar: 'bg-cyan-500', tile: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300', wash: 'from-cyan-500/[0.10]' },
  emerald: { text: 'text-soil-700 dark:text-soil-200', bar: 'bg-soil-500', tile: 'bg-soil-100 text-soil-700 dark:bg-soil-500/25 dark:text-soil-200', wash: 'from-soil-400/[0.12]' },
  teal: { text: 'text-harvest-700 dark:text-harvest-300', bar: 'bg-harvest-500', tile: 'bg-harvest-100 text-harvest-800 dark:bg-harvest-500/20 dark:text-harvest-200', wash: 'from-harvest-400/[0.14]' },
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
    <Card className={`fs-lift p-4 sm:p-5 rounded-[var(--radius-card)] flex flex-col bg-gradient-to-br ${c.wash} to-transparent`}>
      <div className="flex items-start justify-between gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <span className="leading-snug">{label}</span>
        <span className={`h-10 w-10 sm:h-11 sm:w-11 rounded-2xl flex items-center justify-center shrink-0 ${c.tile}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <div className="mt-auto pt-4 flex flex-wrap items-baseline gap-x-2">
        <span className={`fs-display text-[1.5rem] sm:text-[1.75rem] lg:text-[2rem] ${titleText}`}>{value}</span>
        {delta !== undefined && (
          <span className={`text-xs font-bold flex items-center px-2 py-0.5 rounded-full ${up ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/10 text-red-600 dark:text-red-300'}`}>
            {up ? <TrendingUp className="h-4 w-4 mr-0.5" /> : <TrendingDown className="h-4 w-4 mr-0.5" />}
            {deltaText ?? `${signed(delta, 0, lang)}${deltaSuffix}`}
          </span>
        )}
      </div>
      <span className="block text-xs mt-1.5 leading-snug text-slate-500 dark:text-slate-400">{note}</span>
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
              <div className="shrink-0">
                <CropIcon id={crop.id} size={48} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className={`font-medium text-sm lg:text-base ${titleText}`}>{lang === 'bn' ? crop.nameBn : crop.name}</h4>
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
