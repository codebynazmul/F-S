'use client';

import React, { useState } from 'react';
import { CloudRain, Droplets, Flame, Globe, RefreshCw, Sun, Thermometer, WifiOff, type LucideIcon } from 'lucide-react';
import { useNasaPower } from '@/lib/nasaPower';
import { useApp } from '../AppProvider';
import { Card, Skeleton, SubCard, TabHeader, ghostBtn, titleText } from '../ui';

// Rough monsoon shape for the loading placeholder.
const SKELETON_BARS = [30, 25, 40, 55, 70, 90, 100, 95, 75, 50, 30, 20];

const MONTHS_EN = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTHS_BN = ['জা', 'ফে', 'মা', 'এ', 'মে', 'জু', 'জু', 'আ', 'সে', 'অ', 'ন', 'ডি'];

export default function NasaTab() {
  const { t, n, lang, district } = useApp();
  const { status, data, latencyMs, retry } = useNasaPower(district.lat, district.lng);

  return (
    <div className="space-y-6 card-rise">
      <Card className="p-6 rounded-4xl space-y-6 shadow-xl">
        <TabHeader
          icon={Globe}
          title={t('NASA Earth Data', 'নাসা আর্থ পর্যবেক্ষণ')}
          description={t(
            `Long-term monthly climate averages for ${district.name} (${district.lat.toFixed(2)}°N, ${district.lng.toFixed(2)}°E) from the NASA POWER API.`,
            `নাসা POWER API থেকে ${district.nameBn} জেলার (${district.lat.toFixed(2)}°N, ${district.lng.toFixed(2)}°E) দীর্ঘমেয়াদি মাসিক জলবায়ু গড়।`
          )}
          actions={<StatusPill status={status} latencyMs={latencyMs} onRetry={retry} />}
        />

        {status === 'loading' && (
          <div className="space-y-4" aria-busy="true">
            <span className="sr-only" role="status">{t('Loading data from NASA POWER…', 'নাসা POWER থেকে তথ্য আনা হচ্ছে…')}</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map(i => (
                <SubCard key={i} className="p-4 rounded-2xl space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-3 w-full" />
                </SubCard>
              ))}
            </div>
            <SubCard className="p-5 rounded-2xl space-y-3">
              <Skeleton className="h-4 w-48" />
              <div className="flex items-end gap-1 sm:gap-2 h-40">
                {SKELETON_BARS.map((h, i) => (
                  <div key={i} className="flex-1" style={{ height: `${h}%` }}>
                    <Skeleton className="w-full h-full !rounded-b-none" />
                  </div>
                ))}
              </div>
            </SubCard>
          </div>
        )}

        {status === 'error' && (
          <SubCard className="p-5 rounded-2xl text-sm space-y-3 border border-amber-500/30">
            <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
              <WifiOff className="h-5 w-5 shrink-0" />
              {t('Could not reach NASA POWER. Showing the district baseline instead.', 'নাসা POWER এ সংযোগ হয়নি। জেলার মূল তথ্য দেখানো হচ্ছে।')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Metric icon={CloudRain} color="text-cyan-500" source={t('District baseline', 'জেলার মূল তথ্য')} value={`${n(district.rainfall)} ${t('mm', 'মিমি')}`} label={t('Mean annual rainfall', 'বার্ষিক গড় বৃষ্টিপাত')} />
              <Metric icon={Thermometer} color="text-amber-500" source={t('District baseline', 'জেলার মূল তথ্য')} value={`${n(district.temp, 1)} °C`} label={t('Mean temperature', 'গড় তাপমাত্রা')} />
            </div>
          </SubCard>
        )}

        {status === 'ok' && data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Metric
                icon={CloudRain} color="text-cyan-500" source="NASA POWER"
                value={`${n(data.annualRainMm)} ${t('mm', 'মিমি')}`}
                label={t('Mean annual rainfall', 'বার্ষিক গড় বৃষ্টিপাত')}
                sub={t(`District table: ${district.rainfall.toLocaleString()} mm`, `জেলা তালিকা: ${district.rainfall.toLocaleString('en-US')} মিমি`)}
              />
              <Metric
                icon={Droplets} color="text-sky-500" source="NASA POWER (GWETROOT)"
                value={`${n(data.rootWetness * 100)}%`}
                label={t('Root-zone soil wetness', 'শিকড় স্তরে মাটির আর্দ্রতা')}
                sub={t('0% = dry, 100% = saturated', '০% = শুকনো, ১০০% = সম্পূর্ণ ভেজা')}
              />
              <Metric
                icon={Thermometer} color="text-amber-500" source="NASA POWER"
                value={`${n(data.tempMean, 1)} °C`}
                label={t('Mean air temperature', 'গড় তাপমাত্রা')}
                sub={t(`Humidity ${Math.round(data.humidity)}%`, `আর্দ্রতা ${Math.round(data.humidity)}%`)}
              />
              <Metric
                icon={Flame} color="text-red-500" source={t('Estimated from POWER', 'POWER থেকে হিসাব')}
                value={`${n(data.et0MmDay, 1)} ${t('mm/day', 'মিমি/দিন')}`}
                label={t('Crop water demand (ET₀)', 'ফসলের পানির চাহিদা (ET₀)')}
                sub={t(`Sunlight ${data.solarMJ.toFixed(1)} MJ/m²/day`, `সূর্যালোক ${data.solarMJ.toFixed(1)} MJ/m²/দিন`)}
              />
            </div>

            <SubCard className="p-5 rounded-2xl space-y-3">
              <h3 className={`text-base font-black ${titleText}`}>{t('Monthly rainfall and soil wetness', 'মাসিক বৃষ্টিপাত ও মাটির আর্দ্রতা')}</h3>
              <MonthlyChart rain={data.monthlyRainMm} wet={data.monthlyWetness} labels={lang === 'bn' ? MONTHS_BN : MONTHS_EN} />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {dryMonthsText(data.monthlyRainMm, lang)}
              </p>
            </SubCard>
          </>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-sky-500/10 pt-3">
          {t('Source: NASA Langley Research Center POWER Project (power.larc.nasa.gov). SMAP soil moisture and ECOSTRESS evapotranspiration need a NASA Earthdata account and are not connected yet.',
             'উৎস: নাসা ল্যাংলি রিসার্চ সেন্টার POWER প্রকল্প। SMAP ও ECOSTRESS তথ্যের জন্য নাসা আর্থডেটা একাউন্ট প্রয়োজন, যা এখনো যুক্ত করা হয়নি।')}
        </p>
      </Card>
    </div>
  );
}

function dryMonthsText(rain: number[], lang: 'en' | 'bn') {
  const names = lang === 'bn'
    ? ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dry = rain.map((r, i) => (r < 30 ? names[i] : null)).filter(Boolean) as string[];
  if (dry.length === 0) return lang === 'bn' ? 'কোনো মাসেই ৩০ মিমির কম বৃষ্টি হয় না।' : 'No month gets less than 30 mm of rain.';
  return lang === 'bn'
    ? `শুষ্ক মাস (৩০ মিমির কম বৃষ্টি): ${dry.join(', ')}। এই সময়ে কম পানির ফসল বেছে নিন।`
    : `Dry months (under 30 mm rain): ${dry.join(', ')}. Plan low-water crops for this window.`;
}

const MONTHS_FULL_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_FULL_BN = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

/** Monthly rainfall bars with a mm axis and a soil-wetness strip. Tap or hover a month for details. */
function MonthlyChart({ rain, wet, labels }: { rain: number[]; wet: number[]; labels: string[] }) {
  const { t, n, lang } = useApp();
  const [active, setActive] = useState<number | null>(null);
  // Round the axis top up to a tidy 100 mm step.
  const top = Math.max(100, Math.ceil(Math.max(...rain) / 100) * 100);
  const ticks = [top, top / 2, 0];
  const full = lang === 'bn' ? MONTHS_FULL_BN : MONTHS_FULL_EN;
  const wetPct = (w: number) => (Number.isNaN(w) ? '—' : `${n(w * 100)}%`);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex flex-col justify-between h-44 -mt-2 text-xs text-slate-500 dark:text-slate-400 text-right w-11 shrink-0">
          {ticks.map(v => <span key={v}>{n(v)}</span>)}
        </div>
        <div className="relative flex-1 h-44">
          {ticks.map((v, i) => (
            <div key={v} className={`absolute left-0 right-0 border-t ${i === ticks.length - 1 ? 'border-slate-400/60' : 'border-dashed border-slate-400/25'}`}
                 style={{ top: `${(i / (ticks.length - 1)) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-0.5 sm:gap-1.5" role="img"
               aria-label={t('Monthly rainfall bar chart', 'মাসিক বৃষ্টিপাতের বার চার্ট')}>
            {rain.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(a => (a === i ? null : i))}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                aria-label={`${full[i]}: ${n(r)} ${t('mm', 'মিমি')}, ${t('soil wetness', 'মাটির আর্দ্রতা')} ${wetPct(wet[i])}`}
                className={`relative flex-1 h-full flex items-end rounded-t-md transition-colors ${active === i ? 'bg-cyan-500/10' : ''}`}
              >
                <div className={`w-full rounded-t-md transition-all duration-500 ${active === i ? 'bg-cyan-600' : 'bg-cyan-500'}`}
                     style={{ height: `${(r / top) * 100}%`, minHeight: 2 }} />
                {active === i && (
                  <span className={`card-popup absolute bottom-full mb-1 z-10 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-bold glass-strong shadow-lg text-left ${
                    i < 3 ? 'left-0' : i > 8 ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}>
                    <span className="block text-slate-900 dark:text-slate-50">{full[i]}</span>
                    <span className="block text-cyan-600 dark:text-cyan-300">{t('Rain', 'বৃষ্টি')}: {n(r)} {t('mm', 'মিমি')}</span>
                    <span className="block text-sky-600 dark:text-sky-300">{t('Soil wetness', 'মাটির আর্দ্রতা')}: {wetPct(wet[i])}</span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <span className="w-11 shrink-0 text-xs text-right text-slate-500 dark:text-slate-400 leading-3">{t('wet', 'আর্দ্র')}</span>
        <div className="flex-1 flex gap-0.5 sm:gap-1.5">
          {wet.map((w, i) => (
            <div key={i} className="flex-1 h-3 rounded-sm" style={{ background: `rgba(14,165,233,${Number.isNaN(w) ? 0 : 0.15 + w * 0.85})` }} />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <span className="w-11 shrink-0" />
        <div className="flex-1 flex gap-0.5 sm:gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
          {labels.map((l, i) => <span key={i} className="flex-1 text-center">{l}</span>)}
        </div>
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-cyan-500" />{t('Rain (mm per month)', 'বৃষ্টি (মাসে মিমি)')}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-5 rounded-sm" style={{ background: 'linear-gradient(90deg, rgba(14,165,233,.15), rgba(14,165,233,1))' }} />{t('Soil wetness (darker = wetter)', 'মাটির আর্দ্রতা (গাঢ় = বেশি ভেজা)')}</span>
        <span>{t('Tap a month for details.', 'বিস্তারিত দেখতে মাসে চাপুন।')}</span>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, color, source, value, label, sub }: {
  icon: LucideIcon; color: string; source: string; value: string; label: string; sub?: string;
}) {
  return (
    <SubCard className="p-4 rounded-2xl">
      <div className="flex items-center justify-between text-xs mb-1 text-slate-500 dark:text-slate-400 gap-2">
        <span className="truncate">{source}</span>
        <Icon className={`h-5 w-5 shrink-0 ${color}`} />
      </div>
      <div className={`text-xl sm:text-2xl font-black ${titleText}`}>{value}</div>
      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</div>
      {sub && <div className="text-xs mt-1 text-slate-500 dark:text-slate-400">{sub}</div>}
    </SubCard>
  );
}

export function StatusPill({ status, latencyMs, onRetry }: { status: string; latencyMs?: number; onRetry: () => void }) {
  const { t, n } = useApp();
  if (status === 'ok') {
    return (
      <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex items-center gap-1.5 w-fit">
        <Sun className="h-4 w-4" />{t('Live', 'লাইভ')}{latencyMs !== undefined ? ` · ${n(latencyMs)} ms` : ''}
      </span>
    );
  }
  if (status === 'error') {
    return (
      <button type="button" onClick={onRetry} className={ghostBtn}>
        <RefreshCw className="h-3.5 w-3.5" />{t('Retry', 'আবার চেষ্টা')}
      </button>
    );
  }
  return <span className="text-xs font-bold px-3 py-1.5 rounded-xl glass-subtle w-fit">{t('Connecting…', 'সংযোগ হচ্ছে…')}</span>;
}
