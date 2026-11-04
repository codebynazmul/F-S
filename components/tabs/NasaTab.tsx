'use client';

import React from 'react';
import { CloudRain, Droplets, Flame, Globe, Loader2, RefreshCw, Sun, Thermometer, WifiOff, type LucideIcon } from 'lucide-react';
import { useNasaPower } from '@/lib/nasaPower';
import { useApp } from '../AppProvider';
import { Card, SubCard, TabHeader, ghostBtn, titleText } from '../ui';

const MONTHS_EN = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTHS_BN = ['জা', 'ফে', 'মা', 'এ', 'মে', 'জু', 'জু', 'আ', 'সে', 'অ', 'ন', 'ডি'];

export default function NasaTab() {
  const { t, lang, district } = useApp();
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
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-600 dark:text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
            {t('Loading data from NASA POWER…', 'নাসা POWER থেকে তথ্য আনা হচ্ছে…')}
          </div>
        )}

        {status === 'error' && (
          <SubCard className="p-5 rounded-2xl text-xs space-y-3 border border-amber-500/30">
            <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
              <WifiOff className="h-4 w-4" />
              {t('Could not reach NASA POWER. Showing the district baseline instead.', 'নাসা POWER এ সংযোগ হয়নি। জেলার মূল তথ্য দেখানো হচ্ছে।')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Metric icon={CloudRain} color="text-cyan-500" source={t('District baseline', 'জেলার মূল তথ্য')} value={`${district.rainfall.toLocaleString()} mm`} label={t('Mean annual rainfall', 'বার্ষিক গড় বৃষ্টিপাত')} />
              <Metric icon={Thermometer} color="text-amber-500" source={t('District baseline', 'জেলার মূল তথ্য')} value={`${district.temp} °C`} label={t('Mean temperature', 'গড় তাপমাত্রা')} />
            </div>
          </SubCard>
        )}

        {status === 'ok' && data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Metric
                icon={CloudRain} color="text-cyan-500" source="NASA POWER"
                value={`${data.annualRainMm.toLocaleString()} mm`}
                label={t('Mean annual rainfall', 'বার্ষিক গড় বৃষ্টিপাত')}
                sub={t(`District table: ${district.rainfall.toLocaleString()} mm`, `জেলা তালিকা: ${district.rainfall.toLocaleString()} মিমি`)}
              />
              <Metric
                icon={Droplets} color="text-sky-500" source="NASA POWER (GWETROOT)"
                value={`${Math.round(data.rootWetness * 100)}%`}
                label={t('Root-zone soil wetness', 'শিকড় স্তরে মাটির আর্দ্রতা')}
                sub={t('0% = dry, 100% = saturated', '০% = শুকনো, ১০০% = সম্পূর্ণ ভেজা')}
              />
              <Metric
                icon={Thermometer} color="text-amber-500" source="NASA POWER"
                value={`${data.tempMean.toFixed(1)} °C`}
                label={t('Mean air temperature', 'গড় তাপমাত্রা')}
                sub={t(`Humidity ${Math.round(data.humidity)}%`, `আর্দ্রতা ${Math.round(data.humidity)}%`)}
              />
              <Metric
                icon={Flame} color="text-red-500" source={t('Estimated from POWER', 'POWER থেকে হিসাব')}
                value={`${data.et0MmDay} mm/day`}
                label={t('Crop water demand (ET₀)', 'ফসলের পানির চাহিদা (ET₀)')}
                sub={t(`Sunlight ${data.solarMJ.toFixed(1)} MJ/m²/day`, `সূর্যালোক ${data.solarMJ.toFixed(1)} MJ/m²/দিন`)}
              />
            </div>

            <SubCard className="p-5 rounded-2xl space-y-3">
              <h3 className={`text-sm font-black ${titleText}`}>{t('Monthly rainfall and soil wetness', 'মাসিক বৃষ্টিপাত ও মাটির আর্দ্রতা')}</h3>
              <MonthlyChart rain={data.monthlyRainMm} wet={data.monthlyWetness} labels={lang === 'bn' ? MONTHS_BN : MONTHS_EN} />
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {dryMonthsText(data.monthlyRainMm, lang)}
              </p>
            </SubCard>
          </>
        )}

        <p className="text-[10px] text-slate-600 dark:text-slate-400 border-t border-sky-500/10 pt-3">
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
  const dry = rain.map((r, i) => (r < 30 ? names[i] : null)).filter(Boolean);
  if (dry.length === 0) return lang === 'bn' ? 'কোনো মাসেই ৩০ মিমির কম বৃষ্টি হয় না।' : 'No month gets less than 30 mm of rain.';
  return lang === 'bn'
    ? `শুষ্ক মাস (৩০ মিমির কম বৃষ্টি): ${dry.join(', ')}। এই সময়ে কম পানির ফসল বেছে নিন।`
    : `Dry months (under 30 mm rain): ${dry.join(', ')}. Plan low-water crops for this window.`;
}

function MonthlyChart({ rain, wet, labels }: { rain: number[]; wet: number[]; labels: string[] }) {
  const max = Math.max(...rain, 1);
  return (
    <div className="space-y-1">
      <div className="flex items-end gap-1 sm:gap-2 h-40" role="img" aria-label="Monthly rainfall bar chart">
        {rain.map((r, i) => (
          <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-0.5" title={`${r} mm · ${Math.round((wet[i] || 0) * 100)}% wet`}>
            <span className="text-[9px] font-bold hidden sm:block">{r}</span>
            <div className="w-full rounded-t-md bg-cyan-500 transition-all duration-500" style={{ height: `${(r / max) * 100}%`, minHeight: 2 }} />
          </div>
        ))}
      </div>
      <div className="flex gap-1 sm:gap-2">
        {wet.map((w, i) => (
          <div key={i} className="flex-1 h-2 rounded-sm" style={{ background: `rgba(14,165,233,${Number.isNaN(w) ? 0 : 0.15 + w * 0.85})` }} title={`${Math.round(w * 100)}%`} />
        ))}
      </div>
      <div className="flex gap-1 sm:gap-2 text-[10px] text-slate-600 dark:text-slate-400">
        {labels.map((l, i) => <span key={i} className="flex-1 text-center">{l}</span>)}
      </div>
      <div className="flex gap-4 text-[10px] text-slate-600 dark:text-slate-400 pt-1">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-cyan-500" />Rain (mm)</span>
        <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-sm" style={{ background: 'linear-gradient(90deg, rgba(14,165,233,.15), rgba(14,165,233,1))' }} />Soil wetness</span>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, color, source, value, label, sub }: {
  icon: LucideIcon; color: string; source: string; value: string; label: string; sub?: string;
}) {
  return (
    <SubCard className="p-4 rounded-2xl">
      <div className="flex items-center justify-between text-[10px] mb-1 text-slate-600 dark:text-slate-400 gap-2">
        <span className="truncate">{source}</span>
        <Icon className={`h-4 w-4 shrink-0 ${color}`} />
      </div>
      <div className={`text-xl font-black ${titleText}`}>{value}</div>
      <div className="text-[11px] text-slate-600 dark:text-slate-400">{label}</div>
      {sub && <div className="text-[10px] mt-1 text-slate-500 dark:text-slate-400">{sub}</div>}
    </SubCard>
  );
}

export function StatusPill({ status, latencyMs, onRetry }: { status: string; latencyMs?: number; onRetry: () => void }) {
  const { t } = useApp();
  if (status === 'ok') {
    return (
      <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex items-center gap-1.5">
        <Sun className="h-3.5 w-3.5" />{t('Live', 'লাইভ')}{latencyMs !== undefined ? ` · ${latencyMs} ms` : ''}
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
  return <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl glass-subtle">{t('Connecting…', 'সংযোগ হচ্ছে…')}</span>;
}
