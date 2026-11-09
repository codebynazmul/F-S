'use client';

import React from 'react';
import { CloudRain, FileText, Layers, MapPin, TriangleAlert } from 'lucide-react';
import { ALL_DISTRICTS } from '@/data/districts';
import { DIVISIONS, divisionName } from '@/lib/options';
import { useApp } from './AppProvider';
import { primaryBtn } from './ui';

export default function TopBar() {
  const { t, n, lang, district, setDistrictId, setActiveTab } = useApp();

  return (
    <div className="no-print">
      <header className="glass-bar border-b border-sky-600/10 sticky top-0 z-30 pl-[4.25rem] pr-4 sm:pr-6 lg:px-10 py-2.5">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-[18px] w-[18px] shrink-0 text-sky-700 dark:text-sky-300" aria-hidden />
            <span className="text-base font-medium truncate text-slate-900 dark:text-white">
              {lang === 'bn' ? district.nameBn : district.name}
            </span>
            <span className="hidden md:inline text-sm text-slate-500 dark:text-slate-400 truncate">
              · {divisionName(district.division, lang)} {t('Division', 'বিভাগ')}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <label className="sr-only" htmlFor="district-select">{t('Choose district', 'জেলা নির্বাচন করুন')}</label>
            <select
              id="district-select"
              value={district.id}
              onChange={(e) => setDistrictId(e.target.value)}
              className="fs-field min-h-tap text-sm font-medium rounded-xl pl-3 pr-8 py-2 outline-none cursor-pointer max-w-[170px] sm:max-w-[240px] text-slate-800 dark:text-slate-100"
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
            <button type="button" onClick={() => setActiveTab('report')} className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${primaryBtn}`}>
              <FileText className="h-4 w-4" />
              <span>{t('Open dossier', 'রিপোর্ট দেখুন')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* District facts strip */}
      <div className="border-b border-sky-600/10 px-4 sm:px-6 lg:px-10 py-2.5 overflow-x-auto">
        <dl className="max-w-[1240px] mx-auto flex items-center gap-x-6 gap-y-1 text-sm whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-slate-400" aria-hidden />
            <dt className="text-slate-500 dark:text-slate-400">{t('Soil', 'মাটি')}</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-50">{district.soil}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <CloudRain className="h-4 w-4 text-slate-400" aria-hidden />
            <dt className="text-slate-500 dark:text-slate-400">{t('Rainfall', 'বৃষ্টিপাত')}</dt>
            <dd className="font-medium font-mono text-[0.8125rem] text-sky-700 dark:text-sky-300">{n(district.rainfall)} {t('mm/yr', 'মিমি/বছর')}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <TriangleAlert className="h-4 w-4 text-amber-500" aria-hidden />
            <dt className="text-slate-500 dark:text-slate-400">{t('Main risk', 'প্রধান ঝুঁকি')}</dt>
            <dd className="font-medium text-amber-700 dark:text-amber-400">{lang === 'bn' ? district.riskBn : district.risk}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
