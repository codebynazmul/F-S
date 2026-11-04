'use client';

import React, { useEffect, useState } from 'react';
import { BellRing, CheckCircle2, Radio, Send, Trash2 } from 'lucide-react';
import { ALL_DISTRICTS } from '@/data/districts';
import { ALERT_TYPES, DIVISIONS, divisionName } from '@/lib/options';
import { pick } from '@/lib/i18n';
import { useNasaPower } from '@/lib/nasaPower';
import type { AlertType } from '@/lib/types';
import { useApp } from '../AppProvider';
import { Card, SubCard, TabHeader, inputClass, labelClass, titleText } from '../ui';
import { StatusPill } from './NasaTab';

export default function AdminTab() {
  const { t, lang, user, district, alerts, sendAlert, deleteAlert } = useApp();
  const [division, setDivision] = useState(district.division);
  const [type, setType] = useState<AlertType>('drought');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const power = useNasaPower(district.lat, district.lng);

  useEffect(() => {
    if (!sent) return;
    const id = setTimeout(() => setSent(false), 4000);
    return () => clearTimeout(id);
  }, [sent]);

  if (user?.role !== 'admin') return null;

  const districtCount = ALL_DISTRICTS.filter(d => d.division === division).length;
  const preview = `[${pick(lang, ALERT_TYPES[type].label)}] ${divisionName(division, lang)} ${t('Division', 'বিভাগ')}: ${pick(lang, ALERT_TYPES[type].advice)}${note.trim() ? ` ${note.trim()}` : ''}`;

  const dispatch = () => {
    sendAlert({ division, type, note: note.trim(), sentBy: user.name });
    setNote('');
    setSent(true);
  };

  return (
    <div className="space-y-6 card-rise">
      <Card className="p-6 rounded-4xl space-y-6 shadow-xl">
        <TabHeader
          icon={Radio}
          accent="violet"
          badge={t('Admin Control Panel', 'অ্যাডমিন কন্ট্রোল প্যানেল')}
          title={t('Regional Climate Emergency Broadcast', 'বিভাগীয় জলবায়ু জরুরি সতর্কতা সম্প্রচার')}
          description={<>{t('Signed in as', 'লগইন করেছেন')} <strong className="text-violet-600 dark:text-violet-300">{user.name}</strong></>}
        />

        <SubCard className="p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2 text-violet-600 dark:text-violet-300">
            <BellRing className="h-4 w-4" />{t('New advisory', 'নতুন সতর্কতা')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="adm-div" className={labelClass}>{t('Target Division', 'লক্ষ্য বিভাগ')}</label>
              <select id="adm-div" value={division} onChange={(e) => setDivision(e.target.value)} className={inputClass}>
                {DIVISIONS.map(d => <option key={d.id} value={d.id}>{divisionName(d.id, lang)} {t('Division', 'বিভাগ')}</option>)}
              </select>
              <span className="text-[10px] text-slate-600 dark:text-slate-400">
                {t(`Reaches farmers viewing any of its ${districtCount} districts`, `এর ${districtCount}টি জেলার কৃষকরা দেখতে পাবেন`)}
              </span>
            </div>
            <div>
              <label htmlFor="adm-type" className={labelClass}>{t('Warning Type', 'সতর্কতার ধরণ')}</label>
              <select id="adm-type" value={type} onChange={(e) => setType(e.target.value as AlertType)} className={inputClass}>
                {(Object.keys(ALERT_TYPES) as AlertType[]).map(k => <option key={k} value={k}>{pick(lang, ALERT_TYPES[k].label)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="adm-note" className={labelClass}>{t('Extra note (optional)', 'অতিরিক্ত বার্তা (ঐচ্ছিক)')}</label>
            <textarea id="adm-note" rows={2} maxLength={280} value={note} onChange={(e) => setNote(e.target.value)} className={`${inputClass} text-xs font-normal`} />
          </div>

          <div>
            <span className={labelClass}>{t('Message preview', 'বার্তার নমুনা')}</span>
            <p className="text-xs p-3 rounded-xl glass-subtle border border-sky-500/15 font-mono leading-relaxed">{preview}</p>
          </div>

          <button type="button" onClick={dispatch} className="btn-popup flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-lg">
            <Send className="h-4 w-4" />
            {t(`Broadcast to ${division} Division`, `${divisionName(division, lang)} বিভাগে পাঠান`)}
          </button>

          {sent && (
            <div role="status" className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 card-popup">
              <CheckCircle2 className="h-4 w-4" />
              {t('Alert published. Farmers see it as a banner when they view a district in this division.',
                 'সতর্কতা প্রকাশিত হয়েছে। এই বিভাগের জেলা দেখলে কৃষকরা ব্যানার হিসেবে দেখবেন।')}
            </div>
          )}
          <p className="text-[10px] text-slate-600 dark:text-slate-400">
            {t('Demo: alerts are stored in this browser only. SMS delivery needs a backend and an SMS gateway.',
               'ডেমো: সতর্কতা শুধু এই ব্রাউজারে সংরক্ষিত হয়। এসএমএস পাঠাতে ব্যাকএন্ড ও এসএমএস গেটওয়ে প্রয়োজন।')}
          </p>
        </SubCard>

        <SubCard className="p-5 rounded-2xl space-y-3">
          <h3 className={`font-bold text-sm ${titleText}`}>{t('Broadcast history', 'পাঠানো সতর্কতার তালিকা')} ({alerts.length})</h3>
          {alerts.length === 0 ? (
            <p className="text-xs text-slate-600 dark:text-slate-400">{t('No alerts sent yet.', 'এখনো কোনো সতর্কতা পাঠানো হয়নি।')}</p>
          ) : (
            <ul className="divide-y divide-sky-500/10">
              {alerts.map(a => (
                <li key={a.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold">{pick(lang, ALERT_TYPES[a.type].label)} · {divisionName(a.division, lang)}</div>
                    {a.note && <div className="text-slate-700 dark:text-slate-300">{a.note}</div>}
                    <div className="text-[10px] text-slate-600 dark:text-slate-400">
                      {new Date(a.sentAt).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB')} · {a.sentBy}
                    </div>
                  </div>
                  <button type="button" onClick={() => deleteAlert(a.id)} className="btn-popup p-1.5 rounded-lg text-slate-500 hover:text-red-500" aria-label={t('Withdraw alert', 'সতর্কতা প্রত্যাহার')} title={t('Withdraw alert', 'সতর্কতা প্রত্যাহার')}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SubCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SubCard className="p-4 rounded-xl space-y-2">
            <div className="text-xs text-slate-600 dark:text-slate-400">{t('NASA POWER API', 'নাসা POWER API')}</div>
            <StatusPill status={power.status} latencyMs={power.latencyMs} onRetry={power.retry} />
            <div className="text-[11px] text-slate-600 dark:text-slate-400">{t(`Checked for ${district.name}`, `${district.nameBn} এর জন্য পরীক্ষা করা হয়েছে`)}</div>
          </SubCard>
          <SubCard className="p-4 rounded-xl">
            <div className="text-xs text-slate-600 dark:text-slate-400">{t('Coverage', 'আওতা')}</div>
            <div className={`text-lg font-bold mt-1 ${titleText}`}>{ALL_DISTRICTS.length} {t('districts', 'জেলা')} · {DIVISIONS.length} {t('divisions', 'বিভাগ')}</div>
          </SubCard>
          <SubCard className="p-4 rounded-xl">
            <div className="text-xs text-slate-600 dark:text-slate-400">{t('Active alerts', 'সক্রিয় সতর্কতা')}</div>
            <div className="text-lg font-bold mt-1 text-violet-600 dark:text-violet-300">{alerts.length}</div>
          </SubCard>
        </div>
      </Card>
    </div>
  );
}
