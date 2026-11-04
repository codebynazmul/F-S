import type { DistrictData } from '@/data/districts';
import type { Bi, FarmProfile } from './types';

export interface RiskFlags {
  drought: boolean;
  salinity: boolean;
  flood: boolean;
  cold: boolean;
  heat: boolean;
}

export interface Recommendation {
  plan: string[];
  reasons: Bi[]; // one per season
  risks: RiskFlags;
}

export function detectRisks(d: DistrictData, farm: FarmProfile): RiskFlags {
  const r = d.risk.toLowerCase();
  return {
    drought:
      /drought|arid|groundwater|dry|moisture|tube well|water shortage/.test(r) ||
      d.rainfall < 1600 ||
      farm.irrigation === 'rainfed',
    salinity: /salin|saline|shrimp/.test(r),
    flood: /flood|inundation|waterlog|tidal|haor|surge|standing water|runoff/.test(r),
    cold: /cold/.test(r) || d.temp < 25.0,
    heat: /heat|40°c/.test(r) || d.temp >= 26.7,
  };
}

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
  maize: {
    en: 'Your soil organic matter and irrigation can support high-value hybrid maize.',
    bn: 'আপনার মাটির জৈব পদার্থ ও সেচ সুবিধা উচ্চমূল্যের হাইব্রিড ভুট্টা চাষের উপযোগী।',
  },
} satisfies Record<string, Bi>;

/** Rule-based 4-season rotation for a district and farm. */
export function recommendPlan(d: DistrictData, farm: FarmProfile): Recommendation {
  const risks = detectRisks(d, farm);
  const plan: string[] = [];
  const reasons: Bi[] = [];
  const add = (crop: string, why: Bi) => { plan.push(crop); reasons.push(why); };

  // Season 1 — winter oilseed or cereal
  if (risks.cold && !risks.salinity) add('wheat', R.wheatCold);
  else add('mustard', R.mustard);

  // Season 2 — winter/spring legume (or salt-tolerant wheat)
  if (risks.salinity && plan[0] !== 'wheat') add('wheat', R.wheatSalt);
  else if (risks.drought || risks.heat) add('chickpea', R.chickpea);
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

  return { plan, reasons, risks };
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
