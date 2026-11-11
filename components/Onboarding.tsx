'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE, stepSlide } from '@/lib/motion';
import { ArrowLeft, ArrowRight, Check, CloudRain, Droplets, Layers, LocateFixed, MapPin, Waves } from 'lucide-react';
import { ALL_DISTRICTS } from '@/data/districts';
import { DIVISIONS, IRRIGATION_TYPES, SOIL_TEXTURES, divisionName } from '@/lib/options';
import type { IrrigationType, SoilTexture } from '@/lib/types';
import { useApp } from './AppProvider';
import { LangToggle, Card, inputClass, labelClass, primaryBtn, ghostBtn } from './ui';

const SOIL_HINTS: Record<SoilTexture, { en: string; bn: string }> = {
  sand:       { en: 'Gritty, water drains away fast', bn: 'খসখসে, পানি দ্রুত চলে যায়' },
  sandy_loam: { en: 'Loose, a little gritty', bn: 'ঝুরঝুরে, একটু খসখসে' },
  loam:       { en: 'Soft and crumbly, ideal', bn: 'নরম ও ঝুরঝুরে, আদর্শ' },
  silt_loam:  { en: 'Smooth, like flour when dry', bn: 'মসৃণ, শুকালে ময়দার মতো' },
  clay_loam:  { en: 'Sticky when wet, cracks when dry', bn: 'ভেজা অবস্থায় আঠালো, শুকালে ফাটে' },
  clay:       { en: 'Very sticky, holds water long', bn: 'খুব আঠালো, দীর্ঘ সময় পানি ধরে রাখে' },
  peat:       { en: 'Dark, spongy, low-lying beel land', bn: 'কালো, স্পঞ্জের মতো, নিচু বিল এলাকা' },
};

const IRRIGATION_ICONS: Record<IrrigationType, typeof Droplets> = {
  deep_tw: Droplets,
  shallow_tw: Droplets,
  canal: Waves,
  rainfed: CloudRain,
};

/** Three short steps for new users: district → soil → water and farm size. */
export default function Onboarding() {
  const { t, n, lang, user, district, setDistrictId, farm, updateFarm, finishOnboarding, locationStatus, locate } = useApp();
  const locating = locationStatus === 'locating';
  const locError =
    locationStatus === 'denied' ? t('Could not get your location. Please choose your district from the list.', 'লোকেশন পাওয়া যায়নি। তালিকা থেকে জেলা বেছে নিন।')
    : locationStatus === 'unsupported' ? t('Location is not available on this device.', 'এই ডিভাইসে লোকেশন পাওয়া যাচ্ছে না।')
    : '';
  const [step, setStep] = useState(0);
  // Which way the steps slide: 1 = forward, -1 = back.
  const [dir, setDir] = useState(1);
  const move = (by: 1 | -1) => { setDir(by); setStep(s => s + by); };
  const steps = [
    { icon: MapPin, title: t('Where is your farm?', 'আপনার জমি কোথায়?') },
    { icon: Layers, title: t('What is your soil like?', 'আপনার মাটি কেমন?') },
    { icon: Droplets, title: t('How do you water your crops?', 'আপনি কীভাবে সেচ দেন?') },
  ];
  const last = step === steps.length - 1;

  const optionClass = (active: boolean) =>
    `btn-popup min-h-[56px] w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left cursor-pointer ${
      active ? 'border-sky-600 bg-sky-600/[0.08] shadow-[inset_0_0_0_1px_rgb(var(--sky-600)),0_8px_20px_-12px_rgb(var(--sky-600)/0.6)]' : 'border-sky-600/15 bg-[var(--bg-surface)] hover:border-sky-600/40'
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-bar border-b border-sky-600/10 px-4 sm:px-8 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <img src="/logo-sm.png" alt="" className="h-11 w-11 rounded-2xl object-cover shadow-leaf" />
          <span className="fs-display text-xl">{t('Agro Cosmic Weave', 'অ্যাগ্রো কসমিক উইভ')}</span>
        </div>
        <LangToggle />
      </header>

      <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-6 sm:p-10">
        <Card className="w-full max-w-2xl rounded-[var(--radius-card)] p-5 sm:p-10 space-y-7 card-rise">
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t(`Welcome, ${user?.name ?? ''}! Let's set up your farm.`, `স্বাগতম, ${user?.name ?? ''}! চলুন আপনার খামারের তথ্য দিই।`)}
            </p>
            {/* Progress */}
            <div className="flex items-center gap-2" aria-hidden>
              {steps.map((_, i) => (
                <div key={i} className="h-2 flex-1 rounded-full bg-slate-500/15 overflow-hidden">
                  <motion.div
                    className="h-full w-full bg-gradient-to-r from-sky-500 to-harvest-400"
                    style={{ originX: 0 }}
                    initial={false}
                    animate={{ scaleX: i <= step ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  />
                </div>
              ))}
            </div>
            <p className="fs-eyebrow">
              {t(`Step ${step + 1} of ${steps.length}`, `ধাপ ${step + 1} / ${steps.length}`)}
            </p>
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.h1 key={step} custom={dir} variants={stepSlide} initial="enter" animate="show" exit="exit" className="fs-display text-[1.75rem] sm:text-[2.25rem] flex items-center gap-3">
                <span className="fs-icon-tile h-12 w-12 sm:h-14 sm:w-14 rounded-2xl">
                  {React.createElement(steps[step].icon, { className: 'h-6 w-6 sm:h-7 sm:w-7', 'aria-hidden': true })}
                </span>
                {steps[step].title}
              </motion.h1>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div key={step} custom={dir} variants={stepSlide} initial="enter" animate="show" exit="exit">
          {step === 0 && (
            <div className="space-y-4">
              <button type="button" onClick={() => locate(true)} disabled={locating} className={`${ghostBtn} w-full sm:w-auto text-sm`}>
                <LocateFixed className={`h-5 w-5 ${locating ? 'animate-pulse' : ''}`} />
                {locating ? t('Finding you…', 'খোঁজা হচ্ছে…') : t('Use my location', 'আমার লোকেশন ব্যবহার করুন')}
              </button>
              {locError && <p role="alert" className="text-sm text-amber-700 dark:text-amber-400">{locError}</p>}
              <div>
                <label htmlFor="ob-district" className={labelClass}>{t('Or choose your district', 'অথবা জেলা বেছে নিন')}</label>
                <select id="ob-district" value={district.id} onChange={(e) => setDistrictId(e.target.value)} className={inputClass}>
                  {DIVISIONS.map(div => (
                    <optgroup key={div.id} label={`${divisionName(div.id, lang)} ${t('Division', 'বিভাগ')}`}>
                      {ALL_DISTRICTS.filter(d => d.division === div.id).map(d => (
                        <option key={d.id} value={d.id}>{lang === 'bn' ? d.nameBn : d.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="p-4 rounded-xl glass-subtle text-sm space-y-1">
                <div className="font-medium text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />{lang === 'bn' ? district.nameBn : district.name}, {divisionName(district.division, lang)}
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  {t('Rainfall', 'বৃষ্টিপাত')}: {n(district.rainfall)} {t('mm/yr', 'মিমি/বছর')} · {t('Main risk', 'প্রধান ঝুঁকি')}: {lang === 'bn' ? district.riskBn : district.risk}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('Pick the one closest to your field. Not sure? Keep the selected one — you can change it later.',
                   'আপনার জমির সাথে সবচেয়ে মিল আছে এমনটি বেছে নিন। নিশ্চিত না হলে যেটি বাছাই করা আছে সেটিই রাখুন — পরে বদলানো যাবে।')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label={t('Soil type', 'মাটির ধরণ')}>
                {SOIL_TEXTURES.map(s => {
                  const active = farm.texture === s.id;
                  return (
                    <button key={s.id} type="button" role="radio" aria-checked={active} onClick={() => updateFarm({ texture: s.id })} className={optionClass(active)}>
                      <span className="flex-1">
                        <span className="block text-sm font-medium">{lang === 'bn' ? s.bn : s.en}</span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">{lang === 'bn' ? SOIL_HINTS[s.id].bn : SOIL_HINTS[s.id].en}</span>
                      </span>
                      {active && <Check className="h-5 w-5 text-sky-600 dark:text-sky-300 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(`District soil: ${district.soil}. Have a soil test? Add pH and organic matter later in Farm & Soil Profile.`,
                   `জেলার মাটি: ${district.soil}। মাটি পরীক্ষা করা থাকলে পরে "খামার ও মাটির তথ্য" অংশে pH ও জৈব পদার্থ যোগ করুন।`)}
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label={t('Irrigation source', 'সেচ ব্যবস্থা')}>
                {IRRIGATION_TYPES.map(i => {
                  const active = farm.irrigation === i.id;
                  const Icon = IRRIGATION_ICONS[i.id];
                  return (
                    <button key={i.id} type="button" role="radio" aria-checked={active} onClick={() => updateFarm({ irrigation: i.id })} className={optionClass(active)}>
                      <span className="h-11 w-11 rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="flex-1 text-sm font-medium">{lang === 'bn' ? i.bn : i.en}</span>
                      {active && <Check className="h-5 w-5 text-sky-600 dark:text-sky-300 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <div>
                <label htmlFor="ob-size" className={labelClass}>{t('Farm size (bigha)', 'জমির পরিমাণ (বিঘা)')}</label>
                <input
                  id="ob-size" type="number" inputMode="decimal" min={0.5} max={1000} step={0.5}
                  value={farm.sizeBigha}
                  onChange={(e) => updateFarm({ sizeBigha: Math.min(1000, Math.max(0, Number(e.target.value) || 0)) })}
                  onBlur={() => updateFarm({ sizeBigha: Math.min(1000, Math.max(0.5, farm.sizeBigha)) })}
                  className={`${inputClass} max-w-[200px]`}
                />
              </div>
            </div>
          )}

          </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between gap-3 pt-5 border-t border-sky-600/10">
            {step > 0 ? (
              <button type="button" onClick={() => move(-1)} className={`${ghostBtn} text-sm`}>
                <ArrowLeft className="h-4 w-4" />{t('Back', 'পেছনে')}
              </button>
            ) : (
              <button type="button" onClick={finishOnboarding} className="min-h-tap px-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:underline underline-offset-4">
                {t('Skip for now', 'এখন নয়')}
              </button>
            )}
            <button
              type="button"
              onClick={() => (last ? finishOnboarding() : move(1))}
              className={`flex items-center gap-2 px-7 rounded-full text-[0.9375rem] ${primaryBtn}`}
            >
              {last ? t('Show my crop plan', 'আমার ফসল পরিকল্পনা দেখুন') : t('Next', 'পরবর্তী')}
              {last ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </Card>
      </main>
    </div>
  );
}
