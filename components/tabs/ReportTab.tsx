'use client';

import React, { useState } from 'react';
import { CheckCircle2, ClipboardCopy, Download, FileText } from 'lucide-react';
import { getCrop } from '@/lib/metrics';
import { pick, signed } from '@/lib/i18n';
import { soilAdvice } from '@/lib/recommend';
import { BIGHA_ACRE, BIGHA_HA, BIGHA_M2, IRRIGATION_TYPES, SOIL_TEXTURES, divisionName } from '@/lib/options';
import { useApp } from '../AppProvider';
import { Card, SubCard, TabHeader, ghostBtn, primaryBtn, titleText } from '../ui';
import { CropIcon } from '../CropIcon';

export default function ReportTab() {
  const { t, n, lang, user, district, farm, recommendedPlan, recommendation, chosenStrategy, isCustomPlan, recMetrics, tradMetrics } = useApp();
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
    `${t('Strategy', 'কৌশল')}: ${chosenStrategy ? pick(lang, chosenStrategy.name) : t('Edited by farmer', 'কৃষকের পরিবর্তিত')}`,
    '',
    ...crops.map((c, i) => `${t(`S${i + 1}`, `মৌসুম ${i + 1}`)}: ${lang === 'bn' ? c.nameBn : c.name} — ${n(c.growingPeriodDays)} ${t('days', 'দিন')}, ${n(c.waterMm)} ${t('mm', 'মিমি')}`),
    '',
    `${t('Water saved', 'পানি সাশ্রয়')}: ${n(waterSavedM3)} m³/${t('year', 'বছর')}`,
    `${t('Urea saved', 'ইউরিয়া সাশ্রয়')}: ~${n(ureaKg)} ${t('kg', 'কেজি')}/${t('year', 'বছর')}`,
    `${t('Soil health', 'মাটির স্বাস্থ্য')}: ${n(recMetrics.soilScore)}/${n(100)} (${t('was', 'আগে')} ${n(tradMetrics.soilScore)})`,
    '',
    `${t('Check before sowing', 'বোনার আগে যাচাই করুন')}:`,
    ...(chosenStrategy?.checks ?? []).map(c => `- ${pick(lang, c)}`),
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
            <button type="button" onClick={() => window.print()} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${primaryBtn}`}>
              <Download className="h-4 w-4" />{t('Print / Save PDF', 'প্রিন্ট বা পিডিএফ')}
            </button>
          </>
        }
      />

      <Card className="p-4 sm:p-6 lg:p-8 rounded-[var(--radius-card)] space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Fact label={t('District', 'জেলা')} value={`${districtName}, ${divisionName(district.division, lang)}`} />
          <Fact label={t('Farm size', 'জমির পরিমাণ')} value={`${n(farm.sizeBigha, farm.sizeBigha % 1 ? 1 : 0)} ${t('bigha', 'বিঘা')} (${n(farm.sizeBigha * BIGHA_ACRE, 2)} ${t('acres', 'একর')})`} />
          <Fact label={t('Soil', 'মাটি')} value={`${texture ? (lang === 'bn' ? texture.bn : texture.en) : ''} · pH ${n(farm.ph, 1)} · SOM ${n(farm.organicMatter, 1)}%`} />
          <Fact label={t('Irrigation', 'সেচ')} value={irrigation ? (lang === 'bn' ? irrigation.bn : irrigation.en) : ''} />
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-sm text-sky-600 dark:text-sky-300">
            {t('4-Season Crop Schedule', '৪-মৌসুমের ফসল রোপণ সূচি')}
            {chosenStrategy
              ? <span className="ml-2 text-xs font-normal text-slate-600 dark:text-slate-400">({pick(lang, chosenStrategy.name)}{isCustomPlan ? `, ${t('chosen by you', 'আপনার বাছাই')}` : ''})</span>
              : <span className="ml-2 text-xs font-normal text-slate-600 dark:text-slate-400">({t('edited by you', 'আপনার পরিবর্তিত')})</span>}
          </h3>
          {crops.map((c, idx) => (
            <SubCard key={idx} className="p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 break-inside-avoid">
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <CropIcon id={c.id} size={44} />
                  <span className="absolute -top-1.5 -left-1.5 h-6 w-6 rounded-lg font-semibold text-xs flex items-center justify-center bg-sky-600 text-white">{n(idx + 1)}</span>
                </div>
                <div>
                  <div className={`font-medium text-sm ${titleText}`}>{lang === 'bn' ? c.nameBn : c.name}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {t(`~${c.growingPeriodDays} days · Roots: ${c.rootingDepth}`, `জীবনকাল: ~${c.growingPeriodDays} দিন · শিকড়: ${c.rootingDepthBn}`)}
                  </div>
                  {chosenStrategy?.reasons[idx] && (
                    <div className="text-sm mt-1 leading-relaxed text-slate-700 dark:text-slate-300">{pick(lang, chosenStrategy.reasons[idx])}</div>
                  )}
                </div>
              </div>
              <div className="sm:text-right text-sm shrink-0">
                <span className={`font-medium ${c.nBalanceKgHa > 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-400'}`}>
                  {signed(c.nBalanceKgHa, 0, lang)} {t('kg N/ha', 'কেজি N/হে.')}
                </span>
                <span className="block text-sm text-cyan-600 dark:text-cyan-300">{n(c.waterMm)} {t('mm', 'মিমি')}</span>
              </div>
            </SubCard>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Fact big label={t('Water saved per year', 'বছরে পানি সাশ্রয়')} value={`${n(waterSavedM3)} m³`} sub={`${n(waterSavedMm)} ${t('mm', 'মিমি')} ${t('vs current practice', 'প্রচলিত ধারার তুলনায়')}`} />
          <Fact big label={t('Urea saved per year', 'বছরে ইউরিয়া সাশ্রয়')} value={`~${n(ureaKg)} ${t('kg', 'কেজি')}`} sub={t(`${signed(nGainKg)} kg nitrogen on your farm`, `আপনার খামারে ${signed(nGainKg)} কেজি নাইট্রোজেন`)} />
          <Fact big label={t('Soil health score', 'মাটির স্বাস্থ্য স্কোর')} value={`${n(recMetrics.soilScore)}/${n(100)}`} sub={`${t('Current practice', 'প্রচলিত')}: ${n(tradMetrics.soilScore)}/${n(100)}`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SubCard className="p-4 rounded-2xl space-y-2 break-inside-avoid border border-amber-500/25">
            <h3 className="font-medium text-sm text-amber-700 dark:text-amber-400">{t('Check with your agriculture officer before sowing', 'বোনার আগে কৃষি কর্মকর্তার সাথে যাচাই করুন')}</h3>
            <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
              {(chosenStrategy?.checks.length ? chosenStrategy.checks : [{
                en: 'This plan was edited by hand, so it has no automatic checks. Review every crop with your agriculture officer.',
                bn: 'এই পরিকল্পনা হাতে পরিবর্তন করা, তাই স্বয়ংক্রিয় যাচাই নেই। প্রতিটি ফসল কৃষি কর্মকর্তার সাথে মিলিয়ে নিন।',
              }]).map((c, i) => <li key={i}>{pick(lang, c)}</li>)}
            </ul>
          </SubCard>
          <SubCard className="p-4 rounded-2xl space-y-2 break-inside-avoid">
            <h3 className="font-medium text-sm text-sky-600 dark:text-sky-300">{t('What this plan is based on', 'এই পরিকল্পনা যে তথ্যের উপর ভিত্তি করে')}</h3>
            <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
              {recommendation.evidence.map((e, i) => <li key={i}>{pick(lang, e.text)}</li>)}
            </ul>
            <h3 className="font-medium text-sm text-sky-600 dark:text-sky-300 pt-1">{t('Information gaps', 'তথ্যের ঘাটতি')}</h3>
            <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
              {recommendation.gaps.map((g, i) => <li key={i}>{pick(lang, g)}</li>)}
            </ul>
          </SubCard>
        </div>

        <SubCard className="p-4 rounded-2xl space-y-2 break-inside-avoid">
          <h3 className="font-medium text-sm text-sky-600 dark:text-sky-300">{t('Soil management actions', 'মাটি ব্যবস্থাপনা করণীয়')}</h3>
          <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
            {tips.map((tip, i) => <li key={i}>{pick(lang, tip)}</li>)}
          </ul>
        </SubCard>

        <p className="text-xs text-slate-600 dark:text-slate-400 border-t border-sky-500/10 pt-3">
          {t('Generated by Field Shift (developed by SPIDERX). Figures are planning estimates from a screening model, NASA data and district averages. This plan supports your judgment; it does not replace it. Consult your Upazila Agriculture Officer before making major changes.',
             'ফিল্ড শিফট (ডেভেলপড বাই SPIDERX) দ্বারা তৈরি। সংখ্যাগুলো মডেল, নাসার তথ্য ও জেলার গড় তথ্যের ভিত্তিতে পরিকল্পনামূলক অনুমান। এই পরিকল্পনা আপনার সিদ্ধান্তে সাহায্য করে, এর বিকল্প নয়। বড় পরিবর্তনের আগে উপজেলা কৃষি কর্মকর্তার পরামর্শ নিন।')}
        </p>
      </Card>
    </div>
  );
}

function Fact({ label, value, sub, big }: { label: string; value: string; sub?: string; big?: boolean }) {
  return (
    <SubCard className="p-3.5 rounded-2xl break-inside-avoid">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`${big ? 'text-xl' : 'text-sm'} font-semibold ${titleText}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 dark:text-slate-400">{sub}</div>}
    </SubCard>
  );
}
