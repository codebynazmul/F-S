'use client';

import React, { useState } from 'react';
import { AlertTriangle, CalendarClock, CloudRain, Database, Droplets, Flame, Globe, Leaf, Mountain, RefreshCw, Satellite as SatelliteIcon, Snowflake, Sun, Thermometer, WifiOff, type LucideIcon } from 'lucide-react';
import type { ClimateStatus, Prediction, RecentConditions, RiskKind, RiskLevel, Satellite } from '@/lib/climate';
import { useApp } from '../AppProvider';
import { Card, Skeleton, SubCard, TabHeader, ghostBtn, titleText } from '../ui';

// Rough monsoon shape for the loading placeholder.
const SKELETON_BARS = [30, 25, 40, 55, 70, 90, 100, 95, 75, 50, 30, 20];

const MONTHS_EN = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTHS_BN = ['জা', 'ফে', 'মা', 'এ', 'মে', 'জু', 'জু', 'আ', 'সে', 'অ', 'ন', 'ডি'];

export default function NasaTab() {
  const { t, n, lang, districtBaseline: base, climate, climateStatus, retryClimate } = useApp();
  const data = climate?.normals ?? null;
  const showBaseline = !data && (climateStatus === 'error' || climateStatus === 'missing');

  return (
    <div className="space-y-6 card-rise">
      <Card className="p-6 rounded-[var(--radius-card)] space-y-6">
        <TabHeader
          icon={Globe}
          title={t('NASA Earth Data', 'নাসা আর্থ পর্যবেক্ষণ')}
          description={t(
            `Long-term monthly climate averages and the last 30 days for ${base.name} (${base.lat.toFixed(2)}°N, ${base.lng.toFixed(2)}°E), from NASA POWER.`,
            `নাসা POWER থেকে ${base.nameBn} জেলার (${base.lat.toFixed(2)}°N, ${base.lng.toFixed(2)}°E) দীর্ঘমেয়াদি মাসিক জলবায়ু গড় ও গত ৩০ দিনের তথ্য।`
          )}
          actions={<StatusPill status={climateStatus} hasData={!!data} updatedAt={climate?.updatedAt ?? null} onRetry={retryClimate} />}
        />

        {climateStatus === 'loading' && !data && (
          <div className="space-y-4" aria-busy="true">
            <span className="sr-only" role="status">{t('Loading NASA data…', 'নাসার তথ্য আনা হচ্ছে…')}</span>
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

        {showBaseline && (
          <SubCard className="p-5 rounded-2xl text-sm space-y-3 border border-amber-500/30">
            <div className="flex items-center gap-2 font-medium text-amber-600 dark:text-amber-400">
              {climateStatus === 'error' ? <WifiOff className="h-5 w-5 shrink-0" /> : <Database className="h-5 w-5 shrink-0" />}
              {climateStatus === 'error'
                ? t('Could not load NASA data. Showing the district baseline instead.', 'নাসার তথ্য লোড করা যায়নি। জেলার মূল তথ্য দেখানো হচ্ছে।')
                : t('NASA data for this district has not been synced yet. Showing the district baseline instead.', 'এই জেলার নাসা তথ্য এখনো সংগ্রহ হয়নি। জেলার মূল তথ্য দেখানো হচ্ছে।')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Metric icon={CloudRain} color="text-cyan-500" source={t('District baseline', 'জেলার মূল তথ্য')} value={`${n(base.rainfall)} ${t('mm', 'মিমি')}`} label={t('Mean annual rainfall', 'বার্ষিক গড় বৃষ্টিপাত')} />
              <Metric icon={Thermometer} color="text-amber-500" source={t('District baseline', 'জেলার মূল তথ্য')} value={`${n(base.temp, 1)} °C`} label={t('Mean temperature', 'গড় তাপমাত্রা')} />
            </div>
          </SubCard>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Metric
                icon={CloudRain} color="text-cyan-500" source="NASA POWER"
                value={`${n(data.annualRainMm)} ${t('mm', 'মিমি')}`}
                label={t('Mean annual rainfall', 'বার্ষিক গড় বৃষ্টিপাত')}
                sub={t(`District table: ${base.rainfall.toLocaleString()} mm`, `জেলা তালিকা: ${base.rainfall.toLocaleString('en-US')} মিমি`)}
              />
              <Metric
                icon={Droplets} color="text-sky-500" source="NASA POWER (GWETROOT)"
                value={data.rootWetness == null ? '—' : `${n(data.rootWetness * 100)}%`}
                label={t('Root-zone soil wetness', 'শিকড় স্তরে মাটির আর্দ্রতা')}
                sub={t('0% = dry, 100% = saturated', '০% = শুকনো, ১০০% = সম্পূর্ণ ভেজা')}
              />
              <Metric
                icon={Thermometer} color="text-amber-500" source="NASA POWER"
                value={`${n(data.tempMean, 1)} °C`}
                label={t('Mean air temperature', 'গড় তাপমাত্রা')}
                sub={data.humidity == null ? undefined : t(`Humidity ${Math.round(data.humidity)}%`, `আর্দ্রতা ${n(Math.round(data.humidity))}%`)}
              />
              <Metric
                icon={Flame} color="text-red-500" source={t('Estimated from POWER', 'POWER থেকে হিসাব')}
                value={data.et0MmDay == null ? '—' : `${n(data.et0MmDay, 1)} ${t('mm/day', 'মিমি/দিন')}`}
                label={t('Crop water demand (ET₀)', 'ফসলের পানির চাহিদা (ET₀)')}
                sub={data.solarMJ == null ? undefined : t(`Sunlight ${data.solarMJ.toFixed(1)} MJ/m²/day`, `সূর্যালোক ${n(data.solarMJ, 1)} MJ/m²/দিন`)}
              />
            </div>

            {climate?.predictions && climate.predictions.length > 0 && <RiskCard predictions={climate.predictions} />}
            {climate?.recent && <RecentCard recent={climate.recent} />}
            {climate?.satellite && <SatelliteCard sat={climate.satellite} />}

            <SubCard className="p-5 rounded-2xl space-y-3">
              <h3 className={`fs-display text-[1.125rem] lg:text-[1.25rem] ${titleText}`}>{t('Monthly rainfall and soil wetness', 'মাসিক বৃষ্টিপাত ও মাটির আর্দ্রতা')}</h3>
              <MonthlyChart rain={data.monthlyRainMm} wet={data.monthlyWetness} labels={lang === 'bn' ? MONTHS_BN : MONTHS_EN} />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {dryMonthsText(data.monthlyRainMm, lang)}
              </p>
            </SubCard>
          </>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-sky-500/10 pt-3">
          {t('Sources: NASA POWER (climate), MODIS via ORNL DAAC (vegetation, land temperature, evapotranspiration), and SMAP soil moisture and NASADEM elevation via AppEEARS. Field Shift fetches them on a schedule and keeps only the processed values. Risk levels are simple rules over these values, not a forecast model.',
             'উৎস: নাসা POWER (জলবায়ু), ORNL DAAC-এর মাধ্যমে MODIS (গাছপালা, ভূমির তাপমাত্রা, বাষ্পীভবন), এবং AppEEARS-এর মাধ্যমে SMAP মাটির আর্দ্রতা ও NASADEM উচ্চতা। ফিল্ড শিফট নির্দিষ্ট সময় পরপর তথ্য সংগ্রহ করে এবং শুধু প্রক্রিয়াজাত মান রাখে। ঝুঁকির মাত্রা এসব মানের উপর সহজ নিয়মে হিসাব করা, পূর্বাভাস মডেল নয়।')}
        </p>
      </Card>
    </div>
  );
}

export const RISK_LABEL: Record<RiskKind, [string, string]> = {
  drought: ['Drought', 'খরা'],
  flood: ['Flood', 'বন্যা'],
  heat: ['Heat', 'তাপপ্রবাহ'],
  frost: ['Cold', 'শৈত্যপ্রবাহ'],
  salinity: ['Salinity', 'লবণাক্ততা'],
  crop_stress: ['Crop stress', 'ফসলের চাপ'],
};

export const LEVEL_LABEL: Record<RiskLevel, [string, string]> = {
  low: ['Low', 'কম'],
  medium: ['Medium', 'মাঝারি'],
  high: ['High', 'বেশি'],
};

export const LEVEL_STYLE: Record<RiskLevel, string> = {
  low: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/40',
  high: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/40',
};

const RISK_ORDER: RiskKind[] = ['drought', 'flood', 'heat', 'frost', 'salinity', 'crop_stress'];

/** Current risk levels from the predict-risk function. */
function RiskCard({ predictions }: { predictions: Prediction[] }) {
  const { t, lang } = useApp();
  const sorted = RISK_ORDER.map(k => predictions.find(p => p.kind === k)).filter((p): p is Prediction => !!p);
  const until = new Date(`${sorted[0].validUntil}T00:00:00Z`).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return (
    <SubCard className="p-5 rounded-2xl space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className={`fs-display text-[1.125rem] lg:text-[1.25rem] ${titleText} flex items-center gap-2`}>
          <AlertTriangle className="h-4 w-4 text-amber-500" />{t('Current risk levels', 'বর্তমান ঝুঁকির মাত্রা')}
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">{t(`Valid until ${until}`, `${until} পর্যন্ত প্রযোজ্য`)}</span>
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {sorted.map(p => (
          <li key={p.kind} className={`rounded-xl border px-3 py-2 flex items-center justify-between gap-2 text-sm font-medium ${LEVEL_STYLE[p.level]}`}>
            <span>{t(...RISK_LABEL[p.kind])}</span>
            <span className="text-xs">{t(...LEVEL_LABEL[p.level])}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {t('Based on the last 30 days of NASA data compared with normal, satellite soil moisture and vegetation, and the district profile. Salinity comes from the district profile only.',
           'গত ৩০ দিনের নাসা তথ্য (স্বাভাবিকের সাথে তুলনা), স্যাটেলাইটের মাটির আর্দ্রতা ও গাছপালা এবং জেলার তথ্যের উপর ভিত্তি করে। লবণাক্ততা শুধু জেলার তথ্য থেকে।')}
      </p>
    </SubCard>
  );
}

/** Newest MODIS, SMAP and NASADEM values. */
function SatelliteCard({ sat }: { sat: Satellite }) {
  const { t, n, lang } = useApp();
  const day = (iso: string | null) => (iso
    ? new Date(`${iso}T00:00:00Z`).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
    : '');
  const ndviWord = sat.ndvi === null ? undefined
    : sat.ndvi >= 0.6 ? t('Dense, healthy vegetation', 'ঘন ও সুস্থ গাছপালা')
    : sat.ndvi >= 0.4 ? t('Moderate vegetation', 'মাঝারি গাছপালা')
    : sat.ndvi >= 0.2 ? t('Sparse vegetation or stressed crops', 'কম গাছপালা বা চাপে থাকা ফসল')
    : t('Bare soil, water or built-up land', 'খালি মাটি, পানি বা বসতি');
  return (
    <SubCard className="p-5 rounded-2xl space-y-3">
      <h3 className={`fs-display text-[1.125rem] lg:text-[1.25rem] ${titleText} flex items-center gap-2`}>
        <SatelliteIcon className="h-4 w-4 text-sky-500" />{t('Satellite view (5 × 5 km around the district point)', 'স্যাটেলাইট তথ্য (জেলা বিন্দুর চারপাশে ৫ × ৫ কিমি)')}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric icon={Leaf} color="text-emerald-500" source={`MODIS NDVI${sat.ndviDate ? ` · ${day(sat.ndviDate)}` : ''}`}
          value={sat.ndvi === null ? '—' : n(sat.ndvi, 2)} label={t('Vegetation health', 'গাছপালার অবস্থা')} sub={ndviWord} />
        <Metric icon={Thermometer} color="text-red-500" source="MODIS LST"
          value={sat.lstDayC === null ? '—' : `${n(sat.lstDayC, 1)} °C`} label={t('Daytime land temperature', 'দিনের ভূমির তাপমাত্রা')}
          sub={sat.etMmDay === null ? undefined : t(`Evapotranspiration ${sat.etMmDay.toFixed(1)} mm/day`, `বাষ্পীভবন ${n(sat.etMmDay, 1)} মিমি/দিন`)} />
        <Metric icon={Droplets} color="text-sky-500" source={`SMAP${sat.smapDate ? ` · ${day(sat.smapDate)}` : ''}`}
          value={sat.soilMoistureRoot === null ? '—' : `${n(sat.soilMoistureRoot * 100)}%`}
          label={t('Root-zone soil moisture', 'শিকড় স্তরের মাটির আর্দ্রতা')}
          sub={sat.soilMoistureSurface === null ? t('Water by volume', 'আয়তন অনুযায়ী পানি') : t(`Surface ${Math.round(sat.soilMoistureSurface * 100)}% (water by volume)`, `উপরিস্তর ${n(sat.soilMoistureSurface * 100)}% (আয়তন অনুযায়ী পানি)`)} />
        <Metric icon={Mountain} color="text-amber-600" source="NASADEM"
          value={sat.elevationM === null ? '—' : `${n(sat.elevationM)} ${t('m', 'মি')}`} label={t('Elevation', 'উচ্চতা')}
          sub={t('Low land floods more easily', 'নিচু জমি সহজে প্লাবিত হয়')} />
      </div>
    </SubCard>
  );
}

/** The last 30 days with NASA data, compared with what is normal for those days. */
function RecentCard({ recent: r }: { recent: RecentConditions }) {
  const { t, n, lang } = useApp();
  const end = new Date(`${r.periodEnd}T00:00:00Z`).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const anomaly = r.rainAnomalyPct;
  const anomalyText = anomaly === null
    ? t('Little rain is normal at this time of year.', 'বছরের এই সময়ে সাধারণত বৃষ্টি কম হয়।')
    : anomaly >= 0
      ? t(`${Math.round(anomaly)}% wetter than normal`, `স্বাভাবিকের চেয়ে ${n(anomaly)}% বেশি`)
      : t(`${Math.round(-anomaly)}% drier than normal`, `স্বাভাবিকের চেয়ে ${n(-anomaly)}% কম`);
  const dry = anomaly !== null && anomaly <= -40;

  return (
    <SubCard className="p-5 rounded-2xl space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className={`fs-display text-[1.125rem] lg:text-[1.25rem] ${titleText}`}>{t('Last 30 days', 'গত ৩০ দিন')}</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5" />{t(`Up to ${end} (NASA data arrives a few days late)`, `${end} পর্যন্ত (নাসার তথ্য কয়েক দিন দেরিতে আসে)`)}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric icon={CloudRain} color={dry ? 'text-amber-500' : 'text-cyan-500'} source="NASA POWER"
          value={r.rain30dMm === null ? '—' : `${n(r.rain30dMm)} ${t('mm', 'মিমি')}`}
          label={t('Rainfall', 'বৃষ্টিপাত')}
          sub={r.rain30dNormalMm === null ? undefined : `${anomalyText} · ${t('normal', 'স্বাভাবিক')} ${n(r.rain30dNormalMm)} ${t('mm', 'মিমি')}`} />
        <Metric icon={Sun} color="text-red-500" source="NASA POWER"
          value={r.hotDays30d === null ? '—' : n(r.hotDays30d)}
          label={t('Hot days (35 °C or more)', 'গরম দিন (৩৫ °সে বা বেশি)')}
          sub={r.tmaxMean30d === null ? undefined : t(`Average high ${r.tmaxMean30d.toFixed(1)} °C`, `গড় সর্বোচ্চ ${n(r.tmaxMean30d, 1)} °সে`)} />
        <Metric icon={Snowflake} color="text-sky-500" source="NASA POWER"
          value={r.coldNights30d === null ? '—' : n(r.coldNights30d)}
          label={t('Cold nights (below 10 °C)', 'ঠান্ডা রাত (১০ °সে-এর নিচে)')}
          sub={r.tminMean30d === null ? undefined : t(`Average low ${r.tminMean30d.toFixed(1)} °C`, `গড় সর্বনিম্ন ${n(r.tminMean30d, 1)} °সে`)} />
        <Metric icon={Droplets} color="text-sky-500" source="NASA POWER (GWETROOT)"
          value={r.rootWetness === null ? '—' : `${n(r.rootWetness * 100)}%`}
          label={t('Root-zone soil wetness now', 'এখন শিকড় স্তরে মাটির আর্দ্রতা')}
          sub={t('Latest day available', 'সর্বশেষ পাওয়া দিন')} />
      </div>
    </SubCard>
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
  const wetPct = (w: number | null) => (w == null || !Number.isFinite(w) ? '—' : `${n(w * 100)}%`);

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
                  <span className={`card-popup absolute bottom-full mb-1 z-10 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium glass-strong text-left ${
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
            <div key={i} className="flex-1 h-3 rounded-sm" style={{ background: `rgb(var(--sky-600) / ${w == null || !Number.isFinite(w) ? 0 : 0.12 + w * 0.88})` }} />
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
        <span className="flex items-center gap-1.5"><span className="h-3 w-5 rounded-sm" style={{ background: 'linear-gradient(90deg, rgb(var(--sky-600) / .12), rgb(var(--sky-600) / 1))' }} />{t('Soil wetness (darker = wetter)', 'মাটির আর্দ্রতা (গাঢ় = বেশি ভেজা)')}</span>
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
      <div className="flex items-center justify-between text-xs mb-1 font-mono text-slate-500 dark:text-slate-400 gap-2">
        <span className="truncate">{source}</span>
        <Icon className={`h-5 w-5 shrink-0 ${color}`} />
      </div>
      <div className={`fs-display text-[1.5rem] sm:text-[1.75rem] mt-2 ${titleText}`}>{value}</div>
      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</div>
      {sub && <div className="text-xs mt-1 text-slate-500 dark:text-slate-400">{sub}</div>}
    </SubCard>
  );
}

export function StatusPill({ status, hasData, updatedAt, onRetry }: {
  status: ClimateStatus; hasData: boolean; updatedAt: number | null; onRetry: () => void;
}) {
  const { t, lang } = useApp();
  const date = updatedAt ? new Date(updatedAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { dateStyle: 'medium' }) : null;
  if (status === 'error') {
    return (
      <button type="button" onClick={onRetry} className={ghostBtn}>
        <RefreshCw className="h-3.5 w-3.5" />{hasData ? t('Offline copy · Retry', 'অফলাইন কপি · আবার চেষ্টা') : t('Retry', 'আবার চেষ্টা')}
      </button>
    );
  }
  if (status === 'missing') {
    return <span className="text-xs font-medium px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 w-fit">{t('Not synced yet', 'এখনো সংগ্রহ হয়নি')}</span>;
  }
  if (hasData) {
    return (
      <span className="text-xs font-medium px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex items-center gap-1.5 w-fit">
        <Database className="h-4 w-4" />{date ? t(`Synced ${date}`, `সংগ্রহ ${date}`) : t('Synced', 'সংগ্রহ হয়েছে')}
      </span>
    );
  }
  return <span className="text-xs font-medium px-3 py-1.5 rounded-xl glass-subtle w-fit">{t('Loading…', 'লোড হচ্ছে…')}</span>;
}
