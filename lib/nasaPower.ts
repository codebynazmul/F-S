'use client';

import { useCallback, useEffect, useState } from 'react';

/** Long-term monthly climate averages for one location, from NASA POWER. */
export interface PowerClimate {
  monthlyRainMm: number[];     // 12 values, mm per month
  monthlyWetness: number[];    // 12 values, root-zone soil wetness 0–1
  annualRainMm: number;
  tempMean: number;            // °C
  humidity: number;            // %
  solarMJ: number;             // MJ/m²/day
  rootWetness: number;         // 0–1
  et0MmDay: number;            // estimated reference evapotranspiration
}

export type PowerStatus = 'loading' | 'ok' | 'error';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAYS = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const PARAMS = 'PRECTOTCORR,T2M,RH2M,ALLSKY_SFC_SW_DWN,GWETROOT';

const cache = new Map<string, { data: PowerClimate; latencyMs: number }>();

function parse(json: any): PowerClimate {
  const p = json?.properties?.parameter;
  if (!p) throw new Error('Unexpected response');
  const num = (v: unknown) => (typeof v === 'number' && v > -900 ? v : NaN);

  const monthlyRainMm = MONTHS.map((m, i) => Math.round(num(p.PRECTOTCORR?.[m]) * DAYS[i]));
  const monthlyWetness = MONTHS.map(m => num(p.GWETROOT?.[m]));
  const tempMean = num(p.T2M?.ANN);
  const solarMJ = num(p.ALLSKY_SFC_SW_DWN?.ANN);

  // Hargreaves radiation formula: ET0 = 0.0135 (T + 17.8) Rs, with Rs in mm/day.
  const et0MmDay = 0.0135 * (tempMean + 17.8) * solarMJ * 0.408;

  const data: PowerClimate = {
    monthlyRainMm,
    monthlyWetness,
    annualRainMm: monthlyRainMm.reduce((a, b) => a + b, 0),
    tempMean,
    humidity: num(p.RH2M?.ANN),
    solarMJ,
    rootWetness: num(p.GWETROOT?.ANN),
    et0MmDay: Number(et0MmDay.toFixed(1)),
  };
  if ([data.annualRainMm, data.tempMean].some(Number.isNaN)) throw new Error('Missing values');
  return data;
}

/** Loads NASA POWER climatology for a point. Results are cached per location. */
export function useNasaPower(lat: number, lng: number) {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const [state, setState] = useState<{ status: PowerStatus; data?: PowerClimate; latencyMs?: number }>(
    () => (cache.has(key) ? { status: 'ok', ...cache.get(key)! } : { status: 'loading' })
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const hit = cache.get(key);
    if (hit) { setState({ status: 'ok', ...hit }); return; }

    setState({ status: 'loading' });
    const ctrl = new AbortController();
    let cancelled = false;
    const timer = setTimeout(() => ctrl.abort(), 20000);
    const started = performance.now();
    const url =
      `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=${PARAMS}` +
      `&community=AG&longitude=${lng}&latitude=${lat}&format=JSON`;

    fetch(url, { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(json => {
        const entry = { data: parse(json), latencyMs: Math.round(performance.now() - started) };
        cache.set(key, entry);
        setState({ status: 'ok', ...entry });
      })
      .catch(() => { if (!cancelled) setState({ status: 'error' }); })
      .finally(() => clearTimeout(timer));

    return () => { cancelled = true; clearTimeout(timer); ctrl.abort(); };
  }, [key, lat, lng, attempt]);

  const retry = useCallback(() => { cache.delete(key); setAttempt(a => a + 1); }, [key]);
  return { ...state, retry };
}
