'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Layers, Lightbulb, RotateCcw } from 'lucide-react';
import { BIGHA_ACRE, IRRIGATION_TYPES, SOIL_TEXTURES } from '@/lib/options';
import { soilAdvice } from '@/lib/recommend';
import { pick } from '@/lib/i18n';
import type { FarmProfile, IrrigationType, SoilTexture } from '@/lib/types';
import { DEFAULT_FARM, useApp } from '../AppProvider';
import { Card, SubCard, TabHeader, ghostBtn, inputClass, labelClass, titleText } from '../ui';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export default function FarmProfileTab() {
  const { t, n, lang, farm, updateFarm: saveFarm, district } = useApp();
  const tips = soilAdvice(farm);

  // Show a short "Saved" message after every change.
  const [savedFlash, setSavedFlash] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const updateFarm = (patch: Partial<FarmProfile>) => {
    saveFarm(patch);
    setSavedFlash(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSavedFlash(false), 1800);
  };

  const phLabel =
    farm.ph < 5.5 ? t('Acidic', 'অম্লীয়') :
    farm.ph > 7.8 ? t('Alkaline', 'ক্ষারীয়') :
    farm.ph < 6 || farm.ph > 7.3 ? t('Slightly off', 'সামান্য অস্বাভাবিক') : t('Ideal', 'আদর্শ');
  const somLabel =
    farm.organicMatter < 1.5 ? t('Low', 'কম') : farm.organicMatter < 3 ? t('Medium', 'মাঝারি') : t('Good', 'ভালো');

  return (
    <div className="space-y-6 card-rise">
      <Card className="p-6 rounded-4xl space-y-6 shadow-xl">
        <TabHeader
          icon={Layers}
          title={t('Farm Profile & Soil Lab Values', 'খামার ও মাটির ল্যাব টেস্ট তথ্য')}
          description={t('These values change your crop recommendation and every score in the app. Changes are saved automatically.',
                         'এই তথ্যগুলো আপনার ফসলের পরামর্শ ও সব স্কোর পরিবর্তন করে। পরিবর্তন স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়।')}
          actions={
            <>
              <span role="status" className="contents">
                {savedFlash && (
                  <span className="card-popup min-h-tap flex items-center gap-1.5 px-3 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15">
                    <CheckCircle2 className="h-4 w-4" />{t('Saved', 'সংরক্ষিত')}
                  </span>
                )}
              </span>
              <button type="button" onClick={() => updateFarm(DEFAULT_FARM)} className={ghostBtn}>
                <RotateCcw className="h-4 w-4" />{t('Reset', 'রিসেট')}
              </button>
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label htmlFor="farm-size" className={labelClass}>{t('Cultivated Area (Bigha)', 'মোট আবাদি জমি (বিঘা)')}</label>
            <input
              id="farm-size" type="number" min={0.5} max={1000} step={0.5}
              value={farm.sizeBigha}
              onChange={(e) => updateFarm({ sizeBigha: clamp(Number(e.target.value) || 0, 0, 1000) })}
              onBlur={() => updateFarm({ sizeBigha: clamp(farm.sizeBigha, 0.5, 1000) })}
              className={inputClass}
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ≈ {n(farm.sizeBigha * BIGHA_ACRE, 2)} {t('acres', 'একর')}
            </span>
          </div>

          <div>
            <label htmlFor="farm-texture" className={labelClass}>{t('Soil Texture', 'মাটির ধরণ')}</label>
            <select id="farm-texture" value={farm.texture} onChange={(e) => updateFarm({ texture: e.target.value as SoilTexture })} className={inputClass}>
              {SOIL_TEXTURES.map(s => <option key={s.id} value={s.id}>{lang === 'bn' ? s.bn : s.en}</option>)}
            </select>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('District soil:', 'জেলার মাটি:')} {district.soil}
            </span>
          </div>

          <div>
            <label htmlFor="farm-irrigation" className={labelClass}>{t('Irrigation Source', 'সেচ ব্যবস্থা')}</label>
            <select id="farm-irrigation" value={farm.irrigation} onChange={(e) => updateFarm({ irrigation: e.target.value as IrrigationType })} className={inputClass}>
              {IRRIGATION_TYPES.map(i => <option key={i.id} value={i.id}>{lang === 'bn' ? i.bn : i.en}</option>)}
            </select>
          </div>

          <SubCard className="p-4 rounded-2xl space-y-2">
            <div className="flex justify-between gap-2 text-sm font-bold">
              <label htmlFor="farm-ph">{t('Soil pH', 'মাটির pH')}</label>
              <span>{n(farm.ph, 1)} · {phLabel}</span>
            </div>
            <input id="farm-ph" type="range" min={4} max={9} step={0.1} value={farm.ph} onChange={(e) => updateFarm({ ph: Number(e.target.value) })} className="w-full cursor-pointer" />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{n(4, 1)} {t('acidic', 'অম্লীয়')}</span><span>{n(6.5, 1)}</span><span>{n(9, 1)} {t('alkaline', 'ক্ষারীয়')}</span>
            </div>
          </SubCard>

          <SubCard className="p-4 rounded-2xl space-y-2">
            <div className="flex justify-between gap-2 text-sm font-bold">
              <label htmlFor="farm-som">{t('Organic Matter', 'জৈব পদার্থ')}</label>
              <span>{n(farm.organicMatter, 1)}% · {somLabel}</span>
            </div>
            <input id="farm-som" type="range" min={0.3} max={5} step={0.1} value={farm.organicMatter} onChange={(e) => updateFarm({ organicMatter: Number(e.target.value) })} className="w-full cursor-pointer" />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{n(0.3, 1)}%</span><span>{n(2.5, 1)}%</span><span>{n(5)}%</span>
            </div>
          </SubCard>

          <SubCard className="p-4 rounded-2xl text-sm space-y-1">
            <div className={`font-bold ${titleText}`}>{t('Where do I get these values?', 'এই তথ্য কোথায় পাব?')}</div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {t('Your Upazila Agriculture Office or SRDI (Soil Resource Development Institute) can test a soil sample. If you have no test yet, keep the defaults.',
                 'উপজেলা কৃষি অফিস বা মৃত্তিকা সম্পদ উন্নয়ন ইনস্টিটিউট (SRDI) মাটি পরীক্ষা করে দিতে পারে। পরীক্ষা না থাকলে ডিফল্ট মান রাখুন।')}
            </p>
          </SubCard>
        </div>

        <SubCard className="p-5 rounded-2xl space-y-3">
          <h3 className="text-base font-black flex items-center gap-2 text-sky-600 dark:text-sky-300">
            <Lightbulb className="h-5 w-5" />{t('Soil management advice', 'মাটি ব্যবস্থাপনা পরামর্শ')}
          </h3>
          <ul className="space-y-2 text-sm leading-relaxed">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300 shrink-0 mt-0.5" />
                <span>{pick(lang, tip)}</span>
              </li>
            ))}
          </ul>
        </SubCard>
      </Card>
    </div>
  );
}
