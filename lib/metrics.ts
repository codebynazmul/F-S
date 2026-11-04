import { CROP_DATABASE, type CropInfo } from '@/data/crops';
import type { DistrictData } from '@/data/districts';
import { IRRIGATION_TYPES, SOIL_TEXTURES } from './options';
import type { FarmProfile, SimSettings } from './types';

export interface PlanMetrics {
  totalWaterMm: number;
  netNitrogen: number;   // kg/ha over the whole rotation
  soilScore: number;     // 0–100
  waterStress: number;   // 0–100, higher is worse
  yieldResilience: number; // 0–100
  diversityPct: number;  // share of distinct crop families
  avgCarbon: number;
}

export const NO_SHOCK: SimSettings = { rainDelta: 0, tempDelta: 0, irrigationCut: 0 };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const getCrop = (id: string): CropInfo => CROP_DATABASE[id] ?? CROP_DATABASE.wheat;

const droughtPoints = (c: CropInfo) =>
  c.droughtTolerance === 'High' ? 90 : c.droughtTolerance === 'Medium' ? 65 : 35;

/** How far soil pH is outside the comfortable 6.0–7.0 range. */
const phStress = (ph: number) => Math.max(0, Math.abs(ph - 6.5) - 0.5);

/**
 * Scores a crop plan for a district and farm, optionally under a climate shock.
 * This is a simple screening model meant for comparing plans, not a crop model.
 */
export function calculatePlanMetrics(
  plan: string[],
  district: DistrictData,
  farm: FarmProfile,
  sim: SimSettings = NO_SHOCK
): PlanMetrics {
  const crops = plan.map(getCrop);
  const n = Math.max(1, crops.length);

  const totalWaterMm = crops.reduce((s, c) => s + c.waterMm, 0);
  const netNitrogen = crops.reduce((s, c) => s + c.nBalanceKgHa, 0);
  const avgCarbon = crops.reduce((s, c) => s + c.carbonScore, 0) / n;
  const avgDrought = crops.reduce((s, c) => s + droughtPoints(c), 0) / n;
  const diversity = new Set(crops.map(c => c.family)).size / n;

  const waterFactor = SOIL_TEXTURES.find(t => t.id === farm.texture)?.waterFactor ?? 1;
  const supplyCut = IRRIGATION_TYPES.find(t => t.id === farm.irrigation)?.supplyCut ?? 0;
  const irrigationCut = clamp(sim.irrigationCut + supplyCut, 0, 95);

  const demand = totalWaterMm * (1 + sim.tempDelta * 0.05) * waterFactor;
  const supply = district.rainfall * (1 + sim.rainDelta / 100);
  const waterDeficit = Math.max(0, demand - supply);
  const stressFactor = 1 + irrigationCut / 45;

  const soilScore = clamp(Math.round(
    avgCarbon * 5 +
    (netNitrogen > 0 ? 30 : netNitrogen > -100 ? 15 : 0) +
    diversity * 35 +
    (farm.organicMatter - 1.2) * 6 -
    phStress(farm.ph) * 8
  ), 5, 100);

  const waterStress = clamp(Math.round((waterDeficit / 1100) * 100 * stressFactor), 0, 100);

  const yieldResilience = clamp(Math.round(
    avgDrought -
    sim.tempDelta * 5 -
    Math.abs(sim.rainDelta) * 0.35 +
    diversity * 20 -
    phStress(farm.ph) * 4 -
    waterStress * 0.1
  ), 5, 100);

  return {
    totalWaterMm,
    netNitrogen,
    soilScore,
    waterStress,
    yieldResilience,
    diversityPct: Math.round(diversity * 100),
    avgCarbon,
  };
}

/** Five 0–100 scores used on the analytics tab (higher is better). */
export function performanceScores(m: PlanMetrics) {
  const efficiency = clamp(100 * (1 - m.totalWaterMm / 5000), 0, 100);
  return {
    water: Math.round((100 - m.waterStress + efficiency) / 2),
    organic: m.soilScore,
    nitrogen: Math.round(clamp(((m.netNitrogen + 400) / 600) * 100, 0, 100)),
    drought: m.yieldResilience,
    pest: m.diversityPct,
  };
}

/**
 * Rough soil organic matter (%) at the end of each year if the plan is repeated.
 * Index 0 is today's value.
 */
export function projectOrganicMatter(m: PlanMetrics, startSom: number, years = 3): number[] {
  const yearly = clamp(
    (m.avgCarbon - 5.5) * 0.06 + (m.netNitrogen >= 0 ? 0.04 : m.netNitrogen > -150 ? 0 : -0.04),
    -0.08,
    0.2
  );
  const out = [startSom];
  for (let y = 1; y <= years; y++) out.push(Math.max(0.3, Number((out[y - 1] + yearly).toFixed(2))));
  return out;
}
