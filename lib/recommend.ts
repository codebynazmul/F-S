import type { DistrictData } from '@/data/districts';
import type { DistrictClimate, RiskKind } from './climate';
import { calculatePlanMetrics, performanceScores, type PlanMetrics } from './metrics';
import { DEFAULT_FARM } from './options';
import type { Bi, FarmProfile, Priority } from './types';

/*
 * Rule-based rotation advice.
 *
 * 1. assessConditions() reads the district profile, NASA POWER climate, SMAP soil
 *    moisture, MODIS vegetation and heat, NASADEM elevation, the server's risk levels
 *    and the farm profile. Every rule that fires is kept as evidence.
 * 2. Several rotation strategies are built for those conditions.
 * 3. Each strategy is scored and ranked by the farmer's priorities.
 *
 * These are transparent screening rules, not a crop model. Every result needs local review.
 */

export interface RiskFlags {
  drought: boolean;
  salinity: boolean;
  flood: boolean;
  cold: boolean;
  heat: boolean;
  cropStress: boolean;
}
export type RiskFlag = keyof RiskFlags;

export type EvidenceSource = 'nasa_power' | 'smap' | 'modis' | 'nasadem' | 'risk_model' | 'district' | 'farm';

/** One fact the advice is based on, and the risks it raised (empty if it raised none). */
export interface Evidence {
  source: EvidenceSource;
  text: Bi;
  raises: RiskFlag[];
}

export type StrategyId = 'current' | 'adaptive' | 'small_step' | 'income_fodder' | 'pulse_saver';

export interface Strategy {
  id: StrategyId;
  name: Bi;
  /** Why this strategy was suggested. */
  summary: Bi;
  plan: string[];
  /** One reason per season. Empty for the current practice. */
  reasons: Bi[];
  /** Things a farmer or agriculture officer should check before using it. */
  checks: Bi[];
  metrics: PlanMetrics;
  scores: Record<Priority, number>;
  /** 0–100: how well the strategy fits the farmer's priorities and local risks. */
  match: number;
}

export interface Recommendation {
  /** The best-matching strategy's plan. */
  plan: string[];
  reasons: Bi[];
  risks: RiskFlags;
  evidence: Evidence[];
  /** Data the advice is missing. */
  gaps: Bi[];
  /** Suggested strategies, best match first. */
  strategies: Strategy[];
  /** The farmer's current practice, scored the same way (when given). */
  current: Strategy | null;
  /** Strategies left out for this farm, and why. */
  skipped: Bi[];
}

export interface RecommendOptions {
  climate?: DistrictClimate | null;
  priorities?: Priority[];
  /** What the farmer grows now; added to the comparison. */
  currentPlan?: string[];
}

// ---------- 1. Conditions ----------

const PREDICTION_FLAG: Record<RiskKind, RiskFlag> = {
  drought: 'drought', flood: 'flood', heat: 'heat', frost: 'cold', salinity: 'salinity', crop_stress: 'cropStress',
};
const PREDICTION_NAME: Record<RiskKind, Bi> = {
  drought: { en: 'Drought', bn: 'খরা' },
  flood: { en: 'Flood', bn: 'বন্যা' },
  heat: { en: 'Heat', bn: 'তাপপ্রবাহ' },
  frost: { en: 'Cold', bn: 'শৈত্যপ্রবাহ' },
  salinity: { en: 'Salinity', bn: 'লবণাক্ততা' },
  crop_stress: { en: 'Crop stress', bn: 'ফসলের চাপ' },
};

const round = (v: number, digits = 0) => Number(v.toFixed(digits));

/** Turns the district, NASA data and farm profile into risk flags, keeping the evidence for each. */
export function assessConditions(d: DistrictData, farm: FarmProfile, climate?: DistrictClimate | null) {
  const risks: RiskFlags = { drought: false, salinity: false, flood: false, cold: false, heat: false, cropStress: false };
  const evidence: Evidence[] = [];
  const add = (source: EvidenceSource, raises: RiskFlag[], en: string, bn: string) => {
    raises.forEach(k => { risks[k] = true; });
    evidence.push({ source, text: { en, bn }, raises });
  };

  // District profile (known local hazard).
  const r = d.risk.toLowerCase();
  const fromProfile: RiskFlag[] = [];
  if (/drought|arid|groundwater|dry|moisture|tube well|water shortage/.test(r)) fromProfile.push('drought');
  if (/salin|saline|shrimp/.test(r)) fromProfile.push('salinity');
  if (/flood|inundation|waterlog|tidal|haor|surge|standing water|runoff/.test(r)) fromProfile.push('flood');
  if (/cold/.test(r)) fromProfile.push('cold');
  if (/heat|40°c/.test(r)) fromProfile.push('heat');
  add('district', fromProfile, `Known hazard in ${d.name}: ${d.risk}. Soil: ${d.soil}.`,
      `${d.nameBn} জেলার পরিচিত ঝুঁকি: ${d.riskBn}। মাটি: ${d.soil}।`);

  // Long-term climate (NASA POWER 30-year averages when synced).
  const climateSource: EvidenceSource = climate?.normals ? 'nasa_power' : 'district';
  const rain = round(d.rainfall);
  const temp = round(d.temp, 1);
  if (rain < 1600) {
    add(climateSource, ['drought'], `Average rainfall is ${rain.toLocaleString('en-US')} mm a year, below 1,600 mm, so dry-season water is short.`,
        `গড় বৃষ্টিপাত বছরে ${rain} মিমি, যা ১৬০০ মিমির কম, তাই শুষ্ক মৌসুমে পানির ঘাটতি থাকে।`);
  } else {
    add(climateSource, [], `Average rainfall is ${rain.toLocaleString('en-US')} mm a year.`, `গড় বৃষ্টিপাত বছরে ${rain} মিমি।`);
  }
  if (d.temp < 25) {
    add(climateSource, ['cold'], `Average temperature is ${temp} °C, so winters are cool enough for wheat.`,
        `গড় তাপমাত্রা ${temp} °সে, তাই শীতকাল গমের জন্য যথেষ্ট ঠান্ডা।`);
  } else if (d.temp >= 26.7) {
    add(climateSource, ['heat'], `Average temperature is ${temp} °C, which is hot for winter crops.`,
        `গড় তাপমাত্রা ${temp} °সে, যা শীতকালীন ফসলের জন্য বেশি গরম।`);
  } else {
    add(climateSource, [], `Average temperature is ${temp} °C.`, `গড় তাপমাত্রা ${temp} °সে।`);
  }

  // Last 30 days (NASA POWER).
  const recent = climate?.recent;
  if (recent) {
    if (recent.rainAnomalyPct !== null && recent.rain30dNormalMm !== null && recent.rain30dNormalMm >= 50 && recent.rainAnomalyPct <= -50) {
      const pct = round(Math.abs(recent.rainAnomalyPct));
      add('nasa_power', ['drought'], `The last 30 days had ${pct}% less rain than normal.`, `গত ৩০ দিনে স্বাভাবিকের চেয়ে ${pct}% কম বৃষ্টি হয়েছে।`);
    } else if (recent.rainAnomalyPct !== null && recent.rain30dNormalMm !== null && recent.rain30dNormalMm >= 50 && recent.rainAnomalyPct >= 60) {
      const pct = round(recent.rainAnomalyPct);
      add('nasa_power', ['flood'], `The last 30 days had ${pct}% more rain than normal.`, `গত ৩০ দিনে স্বাভাবিকের চেয়ে ${pct}% বেশি বৃষ্টি হয়েছে।`);
    }
    if (recent.hotDays30d !== null && recent.hotDays30d >= 5) {
      add('nasa_power', ['heat'], `${recent.hotDays30d} days reached 35 °C or more in the last 30 days.`,
          `গত ৩০ দিনে ${recent.hotDays30d} দিন তাপমাত্রা ৩৫ °সে বা তার বেশি ছিল।`);
    }
    if (recent.coldNights30d !== null && recent.coldNights30d >= 5) {
      add('nasa_power', ['cold'], `${recent.coldNights30d} nights fell below 10 °C in the last 30 days.`,
          `গত ৩০ দিনে ${recent.coldNights30d} রাত তাপমাত্রা ১০ °সে-এর নিচে ছিল।`);
    }
  }

  // Satellites (around the district point).
  const sat = climate?.satellite;
  if (sat?.soilMoistureRoot != null) {
    const v = round(sat.soilMoistureRoot, 2);
    if (sat.soilMoistureRoot < 0.15) {
      add('smap', ['drought'], `Root-zone soil moisture is low (${v} m³/m³): roots have little water.`,
          `শিকড় অঞ্চলের মাটির আর্দ্রতা কম (${v} m³/m³): শিকড় কম পানি পাচ্ছে।`);
    } else if (sat.soilMoistureRoot > 0.42) {
      add('smap', ['flood'], `Root-zone soil is close to saturated (${v} m³/m³): waterlogging is likely.`,
          `শিকড় অঞ্চলের মাটি প্রায় পানিতে ভরা (${v} m³/m³): জলাবদ্ধতার সম্ভাবনা।`);
    } else {
      add('smap', [], `Root-zone soil moisture is in a normal range (${v} m³/m³).`, `শিকড় অঞ্চলের মাটির আর্দ্রতা স্বাভাবিক (${v} m³/m³)।`);
    }
  }
  if (sat?.lstDayC != null) {
    const v = round(sat.lstDayC, 1);
    if (sat.lstDayC >= 40) {
      add('modis', ['heat'], `Daytime land surface temperature is ${v} °C: heat stress for crops.`,
          `দিনের ভূপৃষ্ঠের তাপমাত্রা ${v} °সে: ফসলের জন্য তাপের চাপ।`);
    } else {
      add('modis', [], `Daytime land surface temperature is ${v} °C.`, `দিনের ভূপৃষ্ঠের তাপমাত্রা ${v} °সে।`);
    }
  }
  if (sat?.ndvi != null) {
    const v = round(sat.ndvi, 2);
    if (sat.ndvi < 0.3) {
      add('modis', ['cropStress'], `Vegetation index (NDVI) is low (${v}): crops are sparse or stressed, or fields are bare between seasons.`,
          `উদ্ভিদ সূচক (NDVI) কম (${v}): ফসল কম বা চাপে আছে, অথবা দুই মৌসুমের মাঝে জমি খালি।`);
    } else {
      add('modis', [], `Vegetation index (NDVI) is ${v}: vegetation looks healthy.`, `উদ্ভিদ সূচক (NDVI) ${v}: গাছপালা ভালো অবস্থায় আছে।`);
    }
  }
  if (sat?.elevationM != null) {
    const v = round(sat.elevationM);
    if (sat.elevationM < 5) {
      add('nasadem', ['flood'], `Land is only about ${v} m above sea level, so it floods easily.`,
          `জমি সমুদ্রপৃষ্ঠ থেকে মাত্র প্রায় ${v} মিটার উঁচু, তাই সহজে বন্যা হয়।`);
    } else {
      add('nasadem', [], `Land is about ${v} m above sea level.`, `জমি সমুদ্রপৃষ্ঠ থেকে প্রায় ${v} মিটার উঁচু।`);
    }
  }

  // Risk levels computed on the server from the NASA data.
  for (const p of climate?.predictions ?? []) {
    if (p.level === 'low') continue;
    const name = PREDICTION_NAME[p.kind];
    const high = p.level === 'high';
    add('risk_model', [PREDICTION_FLAG[p.kind]], `${name.en} risk is ${high ? 'high' : 'medium'} right now.`,
        `${name.bn} ঝুঁকি এখন ${high ? 'বেশি' : 'মাঝারি'}।`);
  }

  // Farm profile.
  if (farm.irrigation === 'rainfed') {
    add('farm', ['drought'], 'Your farm has no irrigation, so dry-season crops depend on stored soil moisture.',
        'আপনার খামারে সেচ নেই, তাই শুষ্ক মৌসুমের ফসল মাটির জমা আর্দ্রতার উপর নির্ভর করে।');
  }

  return { risks, evidence };
}

/** Risk flags only (kept for callers that don't need the evidence). */
export function detectRisks(d: DistrictData, farm: FarmProfile, climate?: DistrictClimate | null): RiskFlags {
  return assessConditions(d, farm, climate).risks;
}

/** What the advice can't see. */
function informationGaps(farm: FarmProfile, climate: DistrictClimate | null | undefined, evidence: Evidence[]): Bi[] {
  const gaps: Bi[] = [];
  if (!climate?.normals) gaps.push({
    en: 'NASA climate averages are not synced for this district yet, so rainfall and temperature come from the built-in district table.',
    bn: 'এই জেলার নাসা জলবায়ু গড় এখনো সিঙ্ক হয়নি, তাই বৃষ্টি ও তাপমাত্রা জেলার নিজস্ব তালিকা থেকে নেওয়া।',
  });
  if (climate?.satellite?.soilMoistureRoot == null) gaps.push({
    en: 'No SMAP satellite soil moisture yet for this district.',
    bn: 'এই জেলার জন্য এখনো SMAP স্যাটেলাইটের মাটির আর্দ্রতার তথ্য নেই।',
  });
  if (climate?.satellite?.ndvi == null) gaps.push({
    en: 'No MODIS vegetation or land temperature data yet for this district.',
    bn: 'এই জেলার জন্য এখনো MODIS উদ্ভিদ বা ভূপৃষ্ঠের তাপমাত্রার তথ্য নেই।',
  });
  gaps.push({
    en: 'Satellite values describe a 5 × 5 km area around the district centre, not your own field. Field-level data (Landsat, ECOSTRESS) needs your field location, which the app does not collect yet.',
    bn: 'স্যাটেলাইটের মান জেলার কেন্দ্রের চারপাশের ৫ × ৫ কিমি এলাকার, আপনার নিজের জমির নয়। জমি-ভিত্তিক তথ্যের (Landsat, ECOSTRESS) জন্য জমির অবস্থান লাগে, যা অ্যাপ এখনো নেয় না।',
  });
  if (farm.ph === DEFAULT_FARM.ph && farm.organicMatter === DEFAULT_FARM.organicMatter) gaps.push({
    en: 'Soil pH and organic matter are default values, not results from a soil test on your field.',
    bn: 'মাটির pH ও জৈব পদার্থ ডিফল্ট মান, আপনার জমির মাটি পরীক্ষার ফল নয়।',
  });
  if (evidence.some(e => e.raises.includes('salinity')) && !evidence.some(e => e.source !== 'district' && e.raises.includes('salinity'))) gaps.push({
    en: 'Salinity comes from the district profile only. It has not been measured on your field.',
    bn: 'লবণাক্ততার তথ্য শুধু জেলার বিবরণ থেকে নেওয়া, আপনার জমিতে মাপা হয়নি।',
  });
  gaps.push(
    {
      en: 'Income and fodder scores are typical values for Bangladesh, not today\'s market prices near you.',
      bn: 'আয় ও পশুখাদ্যের স্কোর বাংলাদেশের সাধারণ মান, আপনার এলাকার আজকের বাজারদর নয়।',
    },
    {
      en: 'Pests and diseases cannot be seen by satellite, and the app does not check exact sowing and harvest dates for your area.',
      bn: 'স্যাটেলাইট দিয়ে রোগ-পোকা দেখা যায় না, এবং অ্যাপ আপনার এলাকার সঠিক বোনা ও কাটার তারিখ যাচাই করে না।',
    },
  );
  return gaps;
}

// ---------- 2. Strategies ----------

const R = {
  mustard: {
    en: 'Mustard is a short, low-water winter crop that breaks rice pest and disease cycles.',
    bn: 'সরিষা স্বল্পমেয়াদি ও কম পানির শীতকালীন ফসল, যা ধানের রোগ-পোকার চক্র ভেঙে দেয়।',
  },
  wheatCold: {
    en: 'Cool winters here suit wheat, which needs far less water than Boro rice.',
    bn: 'এই জেলার ঠান্ডা শীত গমের জন্য উপযোগী, এবং গমে বোরো ধানের চেয়ে অনেক কম পানি লাগে।',
  },
  wheatSalt: {
    en: 'Salt-tolerant wheat (e.g. BARI Gom 25) copes better than Boro rice on saline dry-season soil and needs far less irrigation.',
    bn: 'লবণ-সহিষ্ণু গমের জাত (যেমন বারি গম ২৫) শুষ্ক মৌসুমের লবণাক্ত মাটিতে বোরো ধানের চেয়ে ভালো টিকে থাকে এবং অনেক কম সেচ লাগে।',
  },
  chickpea: {
    en: "Chickpea's deep taproot reaches stored subsoil moisture and tolerates heat and drought.",
    bn: 'ছোলার গভীর প্রধান শিকড় মাটির নিচের আর্দ্রতা কাজে লাগায় এবং খরা ও তাপ সহ্য করে।',
  },
  lentilFlood: {
    en: 'Lentil matures quickly, so it can be harvested before early-season floods.',
    bn: 'মসুর দ্রুত পাকে, তাই আগাম বন্যার আগেই ঘরে তোলা যায়।',
  },
  lentil: {
    en: 'Lentil adds nitrogen to the soil and needs very little irrigation.',
    bn: 'মসুর ডাল মাটিতে নাইট্রোজেন যোগ করে এবং খুব কম সেচ লাগে।',
  },
  aman: {
    en: 'Transplanted Aman rice grows on monsoon rain instead of pumped groundwater.',
    bn: 'রোপা আমন ধান ভূগর্ভস্থ পানির বদলে বর্ষার বৃষ্টির পানিতে হয়।',
  },
  mungbean: {
    en: 'Mungbean is a 65-day legume; its residue works as green manure and adds nitrogen.',
    bn: 'মুগ ডাল ৬৫ দিনের ডাল ফসল; এর অবশিষ্টাংশ সবুজ সার হিসেবে মাটিতে নাইট্রোজেন যোগ করে।',
  },
  mungbeanFodder: {
    en: 'Mungbean haulm is good green fodder for cattle, and its roots put back nitrogen after maize.',
    bn: 'মুগের গাছ গরুর ভালো সবুজ খাদ্য, এবং এর শিকড় ভুট্টার পর মাটিতে নাইট্রোজেন ফিরিয়ে দেয়।',
  },
  maize: {
    en: 'Your soil organic matter and irrigation can support high-value hybrid maize.',
    bn: 'আপনার মাটির জৈব পদার্থ ও সেচ সুবিধা উচ্চমূল্যের হাইব্রিড ভুট্টা চাষের উপযোগী।',
  },
  maizeIncome: {
    en: 'Winter maize sells well to poultry and fish feed mills, and its stalks feed cattle.',
    bn: 'শীতের ভুট্টা পোল্ট্রি ও মাছের খাদ্য কারখানায় ভালো দামে বিক্রি হয়, আর এর কাণ্ড গরুর খাদ্য।',
  },
  boroKeep: {
    en: 'Keeps one Boro crop, the main cash crop most farmers already know how to grow.',
    bn: 'একটি বোরো ফসল রাখা হয়েছে, যা বেশিরভাগ কৃষকের পরিচিত প্রধান আয়ের ফসল।',
  },
} satisfies Record<string, Bi>;

/** The original rule-based plan: one crop per season chosen for the district's risks. */
function adaptivePlan(risks: RiskFlags, farm: FarmProfile) {
  const plan: string[] = [];
  const reasons: Bi[] = [];
  const add = (crop: string, why: Bi) => { plan.push(crop); reasons.push(why); };

  // Season 1 — winter oilseed or cereal
  if (risks.cold && !risks.salinity) add('wheat', R.wheatCold);
  else add('mustard', R.mustard);

  // Season 2 — winter/spring legume (or salt-tolerant wheat)
  if (risks.salinity && plan[0] !== 'wheat') add('wheat', R.wheatSalt);
  else if ((risks.drought || risks.heat) && !risks.flood) add('chickpea', R.chickpea);
  else if (risks.flood) add('lentil', R.lentilFlood);
  else add('lentil', R.lentil);

  // Season 3 — monsoon rice
  add('rice_aman', R.aman);

  // Season 4 — short summer crop
  const goodIrrigation = farm.irrigation === 'deep_tw' || farm.irrigation === 'shallow_tw';
  if (!risks.drought && !risks.salinity && !risks.flood && goodIrrigation && farm.organicMatter >= 1.5) {
    add('maize', R.maize);
  } else {
    add('mungbean', R.mungbean);
  }
  return { plan, reasons };
}

/** Reasons a crop is a poor fit for these risks. Each one lowers the strategy's match. */
function fitProblems(cropId: string, risks: RiskFlags, farm: FarmProfile): Bi[] {
  const out: Bi[] = [];
  const dry = risks.drought || farm.irrigation === 'rainfed';
  switch (cropId) {
    case 'rice_boro':
      if (dry) out.push({ en: 'Boro needs about 1,250 mm of irrigation. With drought risk or no tube well it can fail, and pumping lowers the water table.',
                          bn: 'বোরোতে প্রায় ১২৫০ মিমি সেচ লাগে। খরার ঝুঁকি থাকলে বা নলকূপ না থাকলে ফসল নষ্ট হতে পারে, আর পানি তোলায় পানির স্তর নামে।' });
      if (risks.salinity) out.push({ en: 'Boro on saline soil yields poorly unless the irrigation water is fresh.',
                                     bn: 'সেচের পানি মিঠা না হলে লবণাক্ত মাটিতে বোরোর ফলন কম হয়।' });
      break;
    case 'maize':
      if (risks.flood) out.push({ en: 'Maize does not survive standing water.', bn: 'জমিতে পানি জমলে ভুট্টা টেকে না।' });
      if (risks.salinity) out.push({ en: 'Maize is sensitive to salty soil.', bn: 'ভুট্টা লবণাক্ত মাটিতে ভালো হয় না।' });
      if (farm.irrigation === 'rainfed') out.push({ en: 'Maize usually needs 3–5 irrigations.', bn: 'ভুট্টায় সাধারণত ৩–৫টি সেচ লাগে।' });
      break;
    case 'chickpea':
      if (risks.flood) out.push({ en: 'Chickpea roots rot in waterlogged soil.', bn: 'জলাবদ্ধ মাটিতে ছোলার শিকড় পচে যায়।' });
      if (risks.salinity) out.push({ en: 'Chickpea is sensitive to salty soil.', bn: 'ছোলা লবণাক্ত মাটিতে ভালো হয় না।' });
      break;
    case 'lentil':
      if (risks.salinity) out.push({ en: 'Lentil is sensitive to salty soil.', bn: 'মসুর লবণাক্ত মাটিতে ভালো হয় না।' });
      break;
    case 'wheat':
      if (risks.heat && !risks.cold) out.push({ en: 'Wheat loses yield when it is hot during grain filling.', bn: 'দানা পুষ্ট হওয়ার সময় গরম থাকলে গমের ফলন কমে যায়।' });
      break;
  }
  return out;
}

/** Things to check locally for each crop, whatever the risks. */
const CROP_CHECKS: Record<string, Bi> = {
  rice_boro: { en: 'Boro: check groundwater depth and pumping cost with your local irrigation office.',
               bn: 'বোরো: পানির স্তরের গভীরতা ও সেচের খরচ স্থানীয় সেচ অফিসে জেনে নিন।' },
  rice_aman: { en: 'Aman: choose a variety that fits your land height and flood timing (e.g. submergence-tolerant BRRI dhan51 or 52 on low land).',
               bn: 'আমন: জমির উচ্চতা ও বন্যার সময় অনুযায়ী জাত বেছে নিন (যেমন নিচু জমিতে জলমগ্নতা-সহিষ্ণু ব্রি ধান৫১ বা ৫২)।' },
  wheat: { en: 'Wheat: wheat blast has hit Bangladesh since 2016. Ask for a blast-resistant variety (e.g. BARI Gom 33) and treated seed.',
           bn: 'গম: ২০১৬ সাল থেকে দেশে গমের ব্লাস্ট রোগ দেখা দিয়েছে। ব্লাস্ট-প্রতিরোধী জাত (যেমন বারি গম ৩৩) ও শোধিত বীজ নিন।' },
  lentil: { en: 'Lentil: watch for Stemphylium blight in foggy weeks, and check that good seed is available locally.',
            bn: 'মসুর: কুয়াশার সপ্তাহে স্টেমফাইলিয়াম ব্লাইট রোগের দিকে নজর রাখুন, এবং ভালো বীজ পাওয়া যায় কিনা দেখুন।' },
  chickpea: { en: 'Chickpea: watch for pod borer, and check that good seed is available locally.',
              bn: 'ছোলা: ফল ছিদ্রকারী পোকার দিকে নজর রাখুন, এবং ভালো বীজ পাওয়া যায় কিনা দেখুন।' },
  mustard: { en: 'Mustard: watch for aphids in cold, foggy weeks.', bn: 'সরিষা: ঠান্ডা ও কুয়াশার সপ্তাহে জাব পোকার দিকে নজর রাখুন।' },
  maize: { en: 'Maize: watch for fall armyworm, and confirm a buyer (feed mill or trader) and price before sowing.',
           bn: 'ভুট্টা: ফল আর্মিওয়ার্ম পোকার দিকে নজর রাখুন, এবং বোনার আগে ক্রেতা (খাদ্য কারখানা বা ব্যবসায়ী) ও দাম নিশ্চিত করুন।' },
  mungbean: { en: 'Mungbean: harvest before heavy monsoon rain, and watch for yellow mosaic virus.',
              bn: 'মুগ: ভারী বর্ষার আগে ফসল তুলুন, এবং হলুদ মোজাইক ভাইরাসের দিকে নজর রাখুন।' },
};

const STRATEGY_INFO: Record<StrategyId, { name: Bi; summary: Bi; checks: Bi[] }> = {
  current: {
    name: { en: 'Current practice', bn: 'প্রচলিত প্রথা' },
    summary: { en: 'What you grow today, scored the same way so you can compare.', bn: 'আপনি এখন যা চাষ করেন, তুলনার জন্য একইভাবে হিসাব করা।' },
    checks: [],
  },
  adaptive: {
    name: { en: 'Climate-adaptive', bn: 'জলবায়ু সহনশীল' },
    summary: { en: 'Picks one crop per season to match the risks found in the NASA data and the district profile.',
               bn: 'নাসার তথ্য ও জেলার বিবরণে পাওয়া ঝুঁকি অনুযায়ী প্রতি মৌসুমে একটি করে ফসল বেছে নেয়।' },
    checks: [],
  },
  small_step: {
    name: { en: 'Small step (Mustard–Boro–Aman)', bn: 'ছোট পরিবর্তন (সরিষা–বোরো–আমন)' },
    summary: { en: 'The smallest change from rice–rice: keeps one Boro crop and adds mustard and mungbean. Mustard–Boro–Aman is a common pattern in Bangladesh.',
               bn: 'ধান–ধান থেকে সবচেয়ে ছোট পরিবর্তন: একটি বোরো রেখে সরিষা ও মুগ যোগ করা। সরিষা–বোরো–আমন দেশে প্রচলিত একটি ধারা।' },
    checks: [{ en: 'Keeps one Boro crop, so dry-season groundwater use stays high.', bn: 'একটি বোরো থাকায় শুষ্ক মৌসুমে ভূগর্ভস্থ পানির ব্যবহার বেশি থাকে।' }],
  },
  income_fodder: {
    name: { en: 'Income & fodder (maize-based)', bn: 'আয় ও পশুখাদ্য (ভুট্টা-ভিত্তিক)' },
    summary: { en: 'Built around maize for cash income and cattle fodder, with two pulse crops to put back the nitrogen maize uses.',
               bn: 'নগদ আয় ও গবাদিপশুর খাদ্যের জন্য ভুট্টা-কেন্দ্রিক, সাথে দুটি ডাল ফসল যা ভুট্টার নেওয়া নাইট্রোজেন ফিরিয়ে দেয়।' },
    checks: [{ en: 'Income depends on feed-mill and poultry demand, which can change quickly.', bn: 'আয় খাদ্য কারখানা ও পোল্ট্রির চাহিদার উপর নির্ভর করে, যা দ্রুত বদলাতে পারে।' }],
  },
  pulse_saver: {
    name: { en: 'Water & soil saver (pulse-based)', bn: 'পানি ও মাটি রক্ষা (ডাল-ভিত্তিক)' },
    summary: { en: 'Uses the least irrigation and adds the most nitrogen: three pulse crops around one rain-fed Aman rice.',
               bn: 'সবচেয়ে কম সেচ ও সবচেয়ে বেশি নাইট্রোজেন: একটি বৃষ্টিনির্ভর আমন ধানের সাথে তিনটি ডাল ফসল।' },
    checks: [{ en: 'Three pulse crops in a row can build up soil-borne disease such as root rot. Ask your agriculture officer, and make sure you can sell that much pulse.',
               bn: 'পরপর তিনটি ডাল ফসলে মাটিবাহিত রোগ (যেমন শিকড় পচা) বাড়তে পারে। কৃষি কর্মকর্তার পরামর্শ নিন, এবং এত ডাল বিক্রি করা যাবে কিনা নিশ্চিত হন।' }],
  },
};

const PRIORITY_IDS: Priority[] = ['water', 'soil', 'income', 'forage', 'resilience'];

function scoresOf(m: PlanMetrics): Record<Priority, number> {
  return {
    water: performanceScores(m).water,
    soil: m.soilScore,
    income: Math.round(m.avgIncome * 10),
    forage: Math.round(m.avgForage * 10),
    resilience: m.yieldResilience,
  };
}

/** Chosen priorities count three times as much as the others. Each poor crop fit costs 8 points. */
function matchOf(scores: Record<Priority, number>, priorities: Priority[], problems: number) {
  let total = 0;
  let weight = 0;
  for (const p of PRIORITY_IDS) {
    const w = priorities.includes(p) ? 3 : 1;
    total += scores[p] * w;
    weight += w;
  }
  return Math.max(0, Math.min(100, Math.round(total / weight - problems * 8)));
}

const setKey = (plan: string[]) => [...plan].sort().join();

/** Builds, scores and ranks the rotation strategies for a district and farm. */
export function recommendPlan(d: DistrictData, farm: FarmProfile, opts: RecommendOptions = {}): Recommendation {
  const { climate, priorities = [], currentPlan } = opts;
  const { risks, evidence } = assessConditions(d, farm, climate);

  const build = (id: StrategyId, plan: string[], reasons: Bi[]): Strategy => {
    const info = STRATEGY_INFO[id];
    const problems = plan.flatMap(c => fitProblems(c, risks, farm));
    const cropChecks = Array.from(new Set(plan)).map(c => CROP_CHECKS[c]).filter(Boolean);
    const metrics = calculatePlanMetrics(plan, d, farm);
    const scores = scoresOf(metrics);
    return {
      id, plan, reasons, name: info.name, summary: info.summary,
      checks: [...problems, ...info.checks, ...cropChecks],
      metrics, scores, match: matchOf(scores, priorities, problems.length),
    };
  };

  const candidates: Strategy[] = [];
  const skipped: Bi[] = [];

  const adaptive = adaptivePlan(risks, farm);
  candidates.push(build('adaptive', adaptive.plan, adaptive.reasons));

  candidates.push(build('small_step', ['mustard', 'rice_boro', 'rice_aman', 'mungbean'], [R.mustard, R.boroKeep, R.aman, R.mungbean]));

  if (risks.flood || risks.salinity || farm.irrigation === 'rainfed') {
    skipped.push({
      en: 'Income & fodder (maize-based) is not shown: maize needs irrigation and does not cope with flooding or salty soil.',
      bn: 'আয় ও পশুখাদ্য (ভুট্টা-ভিত্তিক) দেখানো হয়নি: ভুট্টায় সেচ লাগে এবং বন্যা বা লবণাক্ত মাটি সহ্য করে না।',
    });
  } else {
    candidates.push(build('income_fodder', ['maize', 'lentil', 'rice_aman', 'mungbean'], [R.maizeIncome, R.lentil, R.aman, R.mungbeanFodder]));
  }

  if (risks.flood || risks.salinity) {
    skipped.push({
      en: 'Water & soil saver (pulse-based) is not shown: chickpea and lentil suffer in waterlogged or salty soil.',
      bn: 'পানি ও মাটি রক্ষা (ডাল-ভিত্তিক) দেখানো হয়নি: জলাবদ্ধ বা লবণাক্ত মাটিতে ছোলা ও মসুর ভালো হয় না।',
    });
  } else {
    const dryFirst = risks.drought || risks.heat;
    candidates.push(build('pulse_saver',
      dryFirst ? ['chickpea', 'lentil', 'rice_aman', 'mungbean'] : ['lentil', 'chickpea', 'rice_aman', 'mungbean'],
      dryFirst ? [R.chickpea, R.lentil, R.aman, R.mungbean] : [R.lentil, R.chickpea, R.aman, R.mungbean]));
  }

  // Drop strategies with the same crops as one already listed (or as the current practice).
  const seen = new Set<string>(currentPlan ? [setKey(currentPlan)] : []);
  const strategies = candidates
    .filter(s => (s.id === 'adaptive' || !seen.has(setKey(s.plan))) && (seen.add(setKey(s.plan)), true))
    // Stable sort: on a tie the climate-adaptive plan stays first.
    .sort((a, b) => b.match - a.match);

  const current = currentPlan ? build('current', currentPlan, []) : null;
  if (current && currentPlan && currentPlan.filter(id => id.startsWith('rice')).length >= 3) {
    current.checks.unshift({
      en: 'Continuous paddy creates a hard plough pan, limits subsoil air and drains the water table faster each dry season.',
      bn: 'ক্রমাগত ধান চাষে মাটির নিচে শক্ত স্তর তৈরি হয়, যা শিকড় চলাচলে বাধা দেয় এবং প্রতি শুষ্ক মৌসুমে পানির স্তর দ্রুত নামায়।',
    });
  }

  const best = strategies[0];
  return {
    plan: best.plan,
    reasons: best.reasons,
    risks,
    evidence,
    gaps: informationGaps(farm, climate, evidence),
    strategies,
    current,
    skipped,
  };
}

/** Gains and costs of a strategy compared with the current practice. */
export function compareWithCurrent(s: Strategy, base: Strategy | null): { gains: Bi[]; costs: Bi[] } {
  const gains: Bi[] = [];
  const costs: Bi[] = [];
  if (!base || s.id === 'current') return { gains, costs };
  const m = s.metrics;
  const b = base.metrics;

  const water = b.totalWaterMm - m.totalWaterMm;
  if (water > 0) gains.push({ en: `Needs ${water.toLocaleString('en-US')} mm less water a year than your current rotation.`, bn: `আপনার বর্তমান পর্যায়ক্রমের চেয়ে বছরে ${water} মিমি কম পানি লাগে।` });
  if (water < 0) costs.push({ en: `Needs ${(-water).toLocaleString('en-US')} mm more water a year than your current rotation.`, bn: `আপনার বর্তমান পর্যায়ক্রমের চেয়ে বছরে ${-water} মিমি বেশি পানি লাগে।` });

  const n = m.netNitrogen - b.netNitrogen;
  if (n > 0) gains.push({ en: `Leaves ${n} kg/ha more nitrogen in the soil, so less urea is needed.`, bn: `মাটিতে হেক্টরে ${n} কেজি বেশি নাইট্রোজেন রাখে, তাই কম ইউরিয়া লাগে।` });
  if (n < 0) costs.push({ en: `Takes ${-n} kg/ha more nitrogen from the soil, so more fertiliser is needed.`, bn: `মাটি থেকে হেক্টরে ${-n} কেজি বেশি নাইট্রোজেন নেয়, তাই বেশি সার লাগে।` });

  const soil = m.soilScore - b.soilScore;
  if (soil >= 3) gains.push({ en: `Soil health score ${soil} points higher (more organic matter, better structure).`, bn: `মাটির স্বাস্থ্য স্কোর ${soil} পয়েন্ট বেশি (বেশি জৈব পদার্থ, ভালো গঠন)।` });
  if (soil <= -3) costs.push({ en: `Soil health score ${-soil} points lower.`, bn: `মাটির স্বাস্থ্য স্কোর ${-soil} পয়েন্ট কম।` });

  const div = m.diversityPct - b.diversityPct;
  if (div > 0) gains.push({ en: 'More crop families, which breaks pest and disease cycles.', bn: 'বেশি ধরনের ফসল, যা রোগ-পোকার চক্র ভেঙে দেয়।' });

  const res = m.yieldResilience - b.yieldResilience;
  if (res >= 3) gains.push({ en: `Copes better with drought and heat (${res} points).`, bn: `খরা ও তাপ বেশি সহ্য করে (${res} পয়েন্ট)।` });
  if (res <= -3) costs.push({ en: `Copes less well with drought and heat (${-res} points).`, bn: `খরা ও তাপ কম সহ্য করে (${-res} পয়েন্ট)।` });

  const inc = Math.round((m.avgIncome - b.avgIncome) * 10);
  if (inc >= 5) gains.push({ en: `Higher typical income (+${inc} on a 0–100 scale).`, bn: `সাধারণ আয় বেশি (০–১০০ মাপে +${inc})।` });
  if (inc <= -5) costs.push({ en: `Lower typical income (${inc} on a 0–100 scale). Check local prices.`, bn: `সাধারণ আয় কম (০–১০০ মাপে ${inc})। স্থানীয় বাজারদর দেখুন।` });

  const fod = Math.round((m.avgForage - b.avgForage) * 10);
  if (fod >= 5) gains.push({ en: 'More straw and green fodder for cattle.', bn: 'গবাদিপশুর জন্য বেশি খড় ও সবুজ খাদ্য।' });
  if (fod <= -5) costs.push({ en: 'Less straw and fodder for cattle.', bn: 'গবাদিপশুর জন্য কম খড় ও খাদ্য।' });

  return { gains, costs };
}

/** Practical soil management tips from the farm's lab values. */
export function soilAdvice(farm: FarmProfile): Bi[] {
  const tips: Bi[] = [];
  if (farm.ph < 5.5) tips.push({
    en: 'Soil is acidic. Apply agricultural lime (dolomite) before sowing legumes.',
    bn: 'মাটি অম্লীয়। ডাল ফসল বোনার আগে ডলোচুন প্রয়োগ করুন।',
  });
  if (farm.ph > 7.8) tips.push({
    en: 'Soil is alkaline. Add gypsum and organic matter, and watch for zinc deficiency.',
    bn: 'মাটি ক্ষারীয়। জিপসাম ও জৈব সার দিন; দস্তার ঘাটতির দিকে লক্ষ্য রাখুন।',
  });
  if (farm.organicMatter < 1.5) tips.push({
    en: 'Organic matter is low. Add compost or farmyard manure and keep crop residue in the field.',
    bn: 'জৈব পদার্থ কম। কম্পোস্ট বা গোবর সার দিন এবং ফসলের অবশিষ্টাংশ জমিতে রাখুন।',
  });
  if (farm.texture === 'sand' || farm.texture === 'sandy_loam') tips.push({
    en: 'Sandy soil drains fast. Use mulch and short, frequent irrigation.',
    bn: 'বেলে মাটি দ্রুত পানি হারায়। মালচিং ও অল্প অল্প করে ঘন ঘন সেচ দিন।',
  });
  if (farm.irrigation === 'rainfed') tips.push({
    en: 'Without irrigation, sow short-duration crops right after the monsoon to use stored moisture.',
    bn: 'সেচ না থাকলে বর্ষার পরপরই স্বল্পমেয়াদি ফসল লাগান, যাতে মাটির জমা আর্দ্রতা কাজে লাগে।',
  });
  if (tips.length === 0) tips.push({
    en: 'Soil values are in a healthy range. Keep adding organic matter each season.',
    bn: 'মাটির মানগুলো ভালো অবস্থায় আছে। প্রতি মৌসুমে জৈব সার দেওয়া চালিয়ে যান।',
  });
  return tips;
}
