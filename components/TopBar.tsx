'use client';

import React from 'react';
import { FileText, MapPin } from 'lucide-react';
import { ALL_DISTRICTS } from '@/data/districts';
import { DIVISIONS, divisionName } from '@/lib/options';
import { pick } from '@/lib/i18n';
import { useApp } from './AppProvider';
import { primaryBtn } from './ui';

export default function TopBar() {
  const { t, n, lang, district, setDistrictId, setActiveTab } = useApp();

  return (
    <div className="no-print">
      <header className="glass-bar border-b border-sky-500/15 sticky top-0 z-30 pl-16 pr-4 lg:pl-20 lg:pr-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-bold hidden sm:inline text-slate-600 dark:text-slate-300">
              {t('Selected District:', 'নির্বাচিত জেলা:')}
            </span>
            <span className="text-base font-extrabold flex items-center gap-1.5 text-sky-600 dark:text-sky-300">
              <MapPin className="h-5 w-5 shrink-0" />
              {lang === 'bn' ? district.nameBn : district.name}
            </span>
            <span className="hidden md:inline text-xs px-2 py-0.5 rounded-full border bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25">
              {divisionName(district.division, lang)} {t('Division', 'বিভাগ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="sr-only" htmlFor="district-select">{t('Choose district', 'জেলা নির্বাচন করুন')}</label>
            <select
              id="district-select"
              value={district.id}
              onChange={(e) => setDistrictId(e.target.value)}
              className="min-h-tap text-sm font-bold rounded-xl px-3 py-2 border glass-subtle border-sky-500/25 outline-none cursor-pointer max-w-[200px] sm:max-w-[240px] text-slate-800 dark:text-slate-100"
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
            <button type="button" onClick={() => setActiveTab('report')} className={`hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm ${primaryBtn}`}>
              <FileText className="h-4 w-4" />
              <span>{t('Dossier', 'রিপোর্ট')}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="glass-subtle px-4 lg:px-8 py-2.5 border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400">{t('Soil:', 'মাটি:')}</span>
            <strong className="text-slate-900 dark:text-slate-50">{district.soil}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400">{t('Rainfall:', 'বৃষ্টিপাত:')}</span>
            <strong className="text-sky-600 dark:text-sky-300">{n(district.rainfall)} {t('mm/yr', 'মিমি/বছর')}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 dark:text-slate-400">{t('Primary Risk:', 'প্রধান ঝুঁকি:')}</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{lang === 'bn' ? district.riskBn : district.risk}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
