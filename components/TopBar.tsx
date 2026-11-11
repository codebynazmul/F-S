'use client';

import React from 'react';
import { CloudRain, FileText, Layers, MapPin, Moon, Sun, Sunrise, TriangleAlert, Wheat } from 'lucide-react';
import { ALL_DISTRICTS } from '@/data/districts';
import { DIVISIONS, divisionName } from '@/lib/options';
import { AnimatePresence, motion } from 'motion/react';
import { useApp } from './AppProvider';
import { textSwap } from '@/lib/motion';
import { harvestBtn } from './ui';

/** Bangladesh's three cropping seasons, picked from the current month. */
function currentSeason(month: number) {
  if (month >= 10 || month <= 1) return { en: 'Rabi season', bn: 'রবি মৌসুম', tipEn: 'Winter crops: wheat, mustard, potato, lentil', tipBn: 'শীতের ফসল: গম, সরিষা, আলু, মসুর' };
  if (month <= 5) return { en: 'Kharif-1 season', bn: 'খরিফ-১ মৌসুম', tipEn: 'Summer crops: Aus rice, jute, mung bean', tipBn: 'গ্রীষ্মের ফসল: আউশ ধান, পাট, মুগ ডাল' };
  return { en: 'Kharif-2 (Aman) season', bn: 'খরিফ-২ (আমন) মৌসুম', tipEn: 'Monsoon crops: Aman rice, vegetables', tipBn: 'বর্ষার ফসল: আমন ধান, শাকসবজি' };
}

/** Greeting that follows the time of day. */
function greeting(hour: number) {
  if (hour < 5 || hour >= 19) return { en: 'Good evening', bn: 'শুভ সন্ধ্যা', Icon: Moon };
  if (hour < 12) return { en: 'Good morning', bn: 'শুভ সকাল', Icon: Sunrise };
  return { en: 'Good afternoon', bn: 'শুভ অপরাহ্ন', Icon: Sun };
}

export default function TopBar() {
  const { t, n, lang, user, district, setDistrictId, setActiveTab } = useApp();
  // Read the clock after mount so server and client render the same markup.
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => { setNow(new Date()); }, []);
  const season = currentSeason((now ?? new Date(2026, 0, 1)).getMonth());
  const hello = greeting(now?.getHours() ?? 9);
  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <div className="no-print">
      <header className="glass-bar border-b border-sky-600/10 sticky top-0 z-30 pl-[4.25rem] pr-4 sm:pr-6 lg:pr-10 py-2.5">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-9 w-9 rounded-full bg-sky-600/10 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
              <MapPin className="h-[18px] w-[18px]" aria-hidden />
            </span>
            {/* District name and facts swap with a quick fade when the district changes. */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={`${district.id}-${lang}`} {...textSwap} className="flex items-center gap-2 min-w-0">
                <span className="fs-display text-lg truncate text-slate-900 dark:text-white">
                  {lang === 'bn' ? district.nameBn : district.name}
                </span>
                <span className="hidden md:inline text-sm text-slate-500 dark:text-slate-400 truncate">
                  · {divisionName(district.division, lang)} {t('Division', 'বিভাগ')}
                </span>
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2.5">
            <label className="sr-only" htmlFor="district-select">{t('Choose district', 'জেলা নির্বাচন করুন')}</label>
            <select
              id="district-select"
              value={district.id}
              onChange={(e) => setDistrictId(e.target.value)}
              className="fs-field min-h-tap text-sm font-semibold rounded-full pl-4 pr-8 py-2 outline-none cursor-pointer max-w-[160px] sm:max-w-[240px] text-slate-800 dark:text-slate-100"
            >
              {DIVISIONS.map(div => {
                const list = ALL_DISTRICTS.filter(d => d.division === div.id);
                return (
                  <optgroup key={div.id} label={`${divisionName(div.id, lang)} ${t('Division', 'বিভাগ')} (${list.length})`}>
                    {list.map(d => (
                      <option key={d.id} value={d.id}>{lang === 'bn' ? `${d.nameBn} (${d.name})` : d.name}</option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            <button type="button" onClick={() => setActiveTab('report')} className={`hidden lg:flex items-center gap-2 px-5 py-2 rounded-full text-sm ${harvestBtn}`}>
              <FileText className="h-4 w-4" />
              <span>{t('Open dossier', 'রিপোর্ট দেখুন')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Greeting, crop season and district facts */}
      <div className="px-4 sm:px-6 lg:px-10 pt-4">
        <div className="max-w-[1240px] mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 bg-harvest-100 text-harvest-700 dark:bg-harvest-500/15 dark:text-harvest-300">
              <hello.Icon className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="fs-display text-xl sm:text-2xl text-slate-900 dark:text-white truncate">
                {t(hello.en, hello.bn)}{firstName ? `, ${firstName}` : ''}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1.5 min-w-0">
                <Wheat className="h-4 w-4 shrink-0 text-harvest-600 dark:text-harvest-300" aria-hidden />
                <span className="font-semibold text-harvest-700 dark:text-harvest-300 shrink-0">{t(season.en, season.bn)}</span>
                <span className="hidden sm:inline truncate">· {t(season.tipEn, season.tipBn)}</span>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
            <AnimatePresence mode="wait" initial={false}>
            <motion.dl key={`${district.id}-${lang}`} {...textSwap} className="flex sm:flex-wrap items-center gap-2 text-sm whitespace-nowrap">
              <div className="fs-chip">
                <span className="fs-chip-icon bg-soil-100 text-soil-700 dark:bg-soil-500/20 dark:text-soil-200"><Layers className="h-3.5 w-3.5" aria-hidden /></span>
                <dt className="text-slate-500 dark:text-slate-400">{t('Soil', 'মাটি')}</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-50">{district.soil}</dd>
              </div>
              <div className="fs-chip">
                <span className="fs-chip-icon bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"><CloudRain className="h-3.5 w-3.5" aria-hidden /></span>
                <dt className="text-slate-500 dark:text-slate-400">{t('Rain', 'বৃষ্টি')}</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-50">{n(district.rainfall)} {t('mm/yr', 'মিমি/বছর')}</dd>
              </div>
              <div className="fs-chip !border-amber-500/30 !bg-amber-50 dark:!bg-amber-500/10">
                <span className="fs-chip-icon bg-amber-200/70 text-amber-800 dark:bg-amber-500/25 dark:text-amber-200"><TriangleAlert className="h-3.5 w-3.5" aria-hidden /></span>
                <dt className="text-amber-800/80 dark:text-amber-200/80">{t('Risk', 'ঝুঁকি')}</dt>
                <dd className="font-semibold text-amber-900 dark:text-amber-200">{lang === 'bn' ? district.riskBn : district.risk}</dd>
              </div>
            </motion.dl>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
