import type { Bi, FarmProfile, IrrigationType, Priority, SoilTexture } from './types';

export const DIVISIONS: { id: string; bn: string }[] = [
  { id: 'Dhaka', bn: 'ঢাকা' },
  { id: 'Rajshahi', bn: 'রাজশাহী' },
  { id: 'Chittagong', bn: 'চট্টগ্রাম' },
  { id: 'Khulna', bn: 'খুলনা' },
  { id: 'Barishal', bn: 'বরিশাল' },
  { id: 'Sylhet', bn: 'সিলেট' },
  { id: 'Rangpur', bn: 'রংপুর' },
  { id: 'Mymensingh', bn: 'ময়মনসিংহ' },
];

export const divisionName = (id: string, lang: 'en' | 'bn') =>
  lang === 'bn' ? DIVISIONS.find(d => d.id === id)?.bn ?? id : id;

/** waterFactor > 1 means the soil loses water faster (more stress). */
export const SOIL_TEXTURES: { id: SoilTexture; en: string; bn: string; waterFactor: number }[] = [
  { id: 'sand',       en: 'Sand',       bn: 'বেলে',          waterFactor: 1.25 },
  { id: 'sandy_loam', en: 'Sandy Loam', bn: 'বেলে দোআঁশ',    waterFactor: 1.12 },
  { id: 'loam',       en: 'Loam',       bn: 'দোআঁশ',         waterFactor: 1.0 },
  { id: 'silt_loam',  en: 'Silt Loam',  bn: 'পলি দোআঁশ',     waterFactor: 0.95 },
  { id: 'clay_loam',  en: 'Clay Loam',  bn: 'এঁটেল দোআঁশ',   waterFactor: 0.92 },
  { id: 'clay',       en: 'Clay',       bn: 'এঁটেল',         waterFactor: 0.9 },
  { id: 'peat',       en: 'Peat',       bn: 'পিট (জৈব) মাটি', waterFactor: 0.9 },
];

/** supplyCut = extra % of irrigation water that is unreliable with this source. */
export const IRRIGATION_TYPES: { id: IrrigationType; en: string; bn: string; supplyCut: number }[] = [
  { id: 'deep_tw',    en: 'Deep Tube Well',    bn: 'গভীর নলকূপ',      supplyCut: 0 },
  { id: 'shallow_tw', en: 'Shallow Tube Well', bn: 'অগভীর নলকূপ',     supplyCut: 5 },
  { id: 'canal',      en: 'Canal / River',     bn: 'খাল বা নদীর পানি', supplyCut: 10 },
  { id: 'rainfed',    en: 'Rainfed only',      bn: 'বৃষ্টি নির্ভর',     supplyCut: 40 },
];

/** 1 bigha (33 decimals) in square metres and hectares. */
export const BIGHA_M2 = 1337.8;
export const BIGHA_HA = BIGHA_M2 / 10000;
export const BIGHA_ACRE = 0.33;

/** Farm values used until the farmer enters their own (no soil test yet). */
export const DEFAULT_FARM: FarmProfile = {
  sizeBigha: 8.5,
  texture: 'clay_loam',
  ph: 6.5,
  organicMatter: 1.2,
  irrigation: 'deep_tw',
};

/** Farmer priorities, in the order they are shown. */
export const PRIORITIES: { id: Priority; en: string; bn: string }[] = [
  { id: 'water',      en: 'Save water',          bn: 'পানি সাশ্রয়' },
  { id: 'soil',       en: 'Improve soil',        bn: 'মাটির উন্নতি' },
  { id: 'income',     en: 'More income',         bn: 'বেশি আয়' },
  { id: 'forage',     en: 'Cattle fodder',       bn: 'গবাদিপশুর খাদ্য' },
  { id: 'resilience', en: 'Lower climate risk',  bn: 'কম জলবায়ু ঝুঁকি' },
];
