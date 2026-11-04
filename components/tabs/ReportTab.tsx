'use client';

import React, { useState } from 'react';
import { CheckCircle2, ClipboardCopy, Download, FileText } from 'lucide-react';
import { getCrop } from '@/lib/metrics';
import { pick, signed } from '@/lib/i18n';
import { soilAdvice } from '@/lib/recommend';
import { BIGHA_ACRE, BIGHA_HA, BIGHA_M2, IRRIGATION_TYPES, SOIL_TEXTURES, divisionName } from '@/lib/options';
import { useApp } from '../AppProvider';
import { Card, SubCard, TabHeader, ghostBtn, primaryBtn, titleText } from '../ui';

export default function ReportTab() {
  const { t, lang, user, district, farm, recommendedPlan, recommendation, isCustomPlan, recMetrics, tradMetrics } = useApp();
  const [copied, setCopied] = useState(false);
  if (!user) return null;

  const crops = recommendedPlan.map(getCrop);
  const waterSavedMm = tradMetrics.totalWaterMm - recMetrics.totalWaterMm;
  const waterSavedM3 = Math.round((waterSavedMm / 1000) * farm.sizeBigha * BIGHA_M2);
  const nGainKg = Math.round((recMetrics.netNitrogen - tradMetrics.netNitrogen) * farm.sizeBigha * BIGHA_HA);
  const ureaKg = Math.max(0, Math.round(nGainKg / 0.46));
  const tips = soilAdvice(farm);
  const texture = SOIL_TEXTURES.find(s => s.id === farm.texture);
  const irrigation = IRRIGATION_TYPES.find(i => i.id === farm.irrigation);
  const today = new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const districtName = lang === 'bn' ? district.nameBn : district.name;

  const summaryText = [
    `Field Shift — ${t('Farm Adaptation Plan', 'খামার অভিযোজন পরিকল্পনা')}: ${districtName}`,
    `${t('Farmer', 'কৃষক')}: ${user.name} (${user.phone}) · ${today}`,
    '',
    ...crops.map((c, i) => `S${i + 1}: ${lang === 'bn' ? c.nameBn : c.name} — ${c.growingPeriodDays} ${t('days', 'দিন')}, ${c.waterMm} mm`),
    '',
    `${t('Water saved', 'পানি সাশ্রয়')}: ${waterSavedM3.toLocaleString()} m³/${t('year', 'বছর')}`,
    `${t('Urea saved', 'ইউরিয়া সাশ্রয়')}: ~${ureaKg} kg/${t('year', 'বছর')}`,
    `${t('Soil health', 'মাটির স্বাস্থ্য')}: ${recMetrics.soilScore}/100 (${t('was', 'আগে')} ${tradMetrics.soilScore})`,
  ].join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="space-y-6 card-rise print-area">
      <Card className="p-6 lg:p-8 rounded-4xl space-y-6 shadow-2xl">
        <TabHeader
          icon={FileText}
          badge={t('Farmer Decision Dossier', 'কৃষক পরামর্শ ও কর্মপরিকল্পনা দলিল')}
          title={t(`Farm Adaptation Plan for ${district.name} District`, `${district.nameBn} জেলার জন্য ফসল পর্যায়ক্রম কর্মপরিকল্পনা`)}
          description={`${t('Farmer', 'কৃষক')}: ${user.name}${user.phone !== '—' ? ` (${user.phone})` : ''} · ${today}`}
          actions={
            <>
              <button type="button" onClick={copy} className={ghostBtn}>
                {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
                {copied ? t('Copied', 'কপি হয়েছে') : t('Copy summary', 'সারাংশ কপি')}
              </button>
              <button type="button" onClick={() => window.print()} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs ${primaryBtn}`}>
                <Download className="h-4 w-4" />{t('Print / Save PDF', 'প্রিন্ট বা পিডিএফ')}
              </button>
            </>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <Fact label={t('District', 'জেলা')} value={`${districtName}, ${divisionName(district.division, lang)}`} />
          <Fact label={t('Farm size', 'জমির পরিমাণ')} value={`${farm.sizeBigha} ${t('bigha', 'বিঘা')} (${(farm.sizeBigha * BIGHA_ACRE).toFixed(2)} ${t('acres', 'একর')})`} />
          <Fact label={t('Soil', 'মাটি')} value={`${texture ? (lang === 'bn' ? texture.bn : texture.en) : ''} · pH ${farm.ph.toFixed(1)} · SOM ${farm.organicMatter.toFixed(1)}%`} />
          <Fact label={t('Irrigation', 'সেচ')} value={irrigation ? (lang === 'bn' ? irrigation.bn : irrigation.en) : ''} />
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-sm text-sky-600 dark:text-sky-300">
            {t('4-Season Crop Schedule', '৪-মৌসুমের ফসল রোপণ সূচি')}
            {isCustomPlan && <span className="ml-2 text-[10px] font-normal text-slate-600 dark:text-slate-400">({t('edited by you', 'আপনার পরিবর্তিত')})</span>}
          </h3>
          {crops.map((c, idx) => (
            <SubCard key={idx} className="p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 break-inside-avoid">
              <div className="flex items-start gap-3">
                <span className="h-8 w-8 rounded-xl font-black text-sm flex items-center justify-center bg-sky-600 text-white shrink-0">{idx + 1}</span>
                <div>
                  <div className={`font-bold text-sm ${titleText}`}>{lang === 'bn' ? c.nameBn : c.name}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {t(`~${c.growingPeriodDays} days · Roots: ${c.rootingDepth}`, `জীবনকাল: ~${c.growingPeriodDays} দিন · শিকড়: ${c.rootingDepthBn}`)}
                  </div>
                  {!isCustomPlan && recommendation.reasons[idx] && (
                    <div className="text-[11px] mt-1 text-slate-700 dark:text-slate-300">{pick(lang, recommendation.reasons[idx])}</div>
                  )}
                </div>
              </div>
              <div className="text-right text-xs shrink-0">
                <span className={`font-bold ${c.nBalanceKgHa > 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-400'}`}>
                  {signed(c.nBalanceKgHa)} kg N/ha
                </span>
                <span className="block text-[11px] text-cyan-600 dark:text-cyan-300">{c.waterMm} mm</span>
              </div>
            </SubCard>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Fact big label={t('Water saved per year', 'বছরে পানি সাশ্রয়')} value={`${waterSavedM3.toLocaleString()} m³`} sub={`${waterSavedMm.toLocaleString()} mm ${t('vs current practice', 'প্রচলিত ধারার তুলনায়')}`} />
          <Fact big label={t('Urea saved per year', 'বছরে ইউরিয়া সাশ্রয়')} value={`~${ureaKg} kg`} sub={t(`${signed(nGainKg)} kg nitrogen on your farm`, `আপনার খামারে ${signed(nGainKg)} কেজি নাইট্রোজেন`)} />
          <Fact big label={t('Soil health score', 'মাটির স্বাস্থ্য স্কোর')} value={`${recMetrics.soilScore}/100`} sub={`${t('Current practice', 'প্রচলিত')}: ${tradMetrics.soilScore}/100`} />
        </div>

        <SubCard className="p-4 rounded-2xl space-y-2 break-inside-avoid">
          <h3 className="font-bold text-sm text-sky-600 dark:text-sky-300">{t('Soil management actions', 'মাটি ব্যবস্থাপনা করণীয়')}</h3>
          <ul className="list-disc pl-5 text-xs space-y-1">
            {tips.map((tip, i) => <li key={i}>{pick(lang, tip)}</li>)}
          </ul>
        </SubCard>

        <p className="text-[10px] text-slate-600 dark:text-slate-400 border-t border-sky-500/10 pt-3">
          {t('Generated by Field Shift (developed by SPIDERX). Figures are planning estimates from a screening model and district averages. Consult your Upazila Agriculture Officer before making major changes.',
             'ফিল্ড শিফট (ডেভেলপড বাই SPIDERX) দ্বারা তৈরি। সংখ্যাগুলো মডেল ও জেলার গড় তথ্যের ভিত্তিতে পরিকল্পনামূলক অনুমান। বড় পরিবর্তনের আগে উপজেলা কৃষি কর্মকর্তার পরামর্শ নিন।')}
        </p>
      </Card>
    </div>
  );
}

function Fact({ label, value, sub, big }: { label: string; value: string; sub?: string; big?: boolean }) {
  return (
    <SubCard className="p-3.5 rounded-2xl break-inside-avoid">
      <div className="text-[10px] text-slate-600 dark:text-slate-400">{label}</div>
      <div className={`${big ? 'text-xl' : 'text-xs'} font-black ${titleText}`}>{value}</div>
      {sub && <div className="text-[10px] text-slate-600 dark:text-slate-400">{sub}</div>}
    </SubCard>
  );
}
