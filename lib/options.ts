import type { AlertType, Bi, IrrigationType, SoilTexture } from './types';

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

export const ALERT_TYPES: Record<AlertType, { label: Bi; advice: Bi }> = {
  drought: {
    label: { en: 'Drought & Groundwater Deficit', bn: 'খরা ও ভূগর্ভস্থ পানি সংকট' },
    advice: {
      en: 'Avoid extra Boro irrigation; switch to pulses and mustard.',
      bn: 'বোরো ধানে অতিরিক্ত সেচ এড়িয়ে চলুন; ডাল ও সরিষা চাষ করুন।',
    },
  },
  salinity: {
    label: { en: 'Soil Salinity Surge', bn: 'লবণাক্ততা বৃদ্ধি' },
    advice: {
      en: 'Do not irrigate with river water at high tide; use salt-tolerant varieties.',
      bn: 'জোয়ারের সময় নদীর পানি দিয়ে সেচ দেবেন না; লবণ-সহিষ্ণু জাত ব্যবহার করুন।',
    },
  },
  flood: {
    label: { en: 'Early Flash Flood', bn: 'আগাম পাহাড়ি ঢল ও বন্যা' },
    advice: {
      en: 'Harvest mature crops early and move seed and fertilizer to high ground.',
      bn: 'পাকা ফসল দ্রুত কেটে ফেলুন এবং বীজ ও সার উঁচু জায়গায় সরিয়ে রাখুন।',
    },
  },
  cold: {
    label: { en: 'Cold Wave Advisory', bn: 'তীব্র শৈত্যপ্রবাহ ও কুয়াশা' },
    advice: {
      en: 'Protect seedbeds with polythene at night and drain cold water from fields.',
      bn: 'রাতে বীজতলা পলিথিন দিয়ে ঢেকে রাখুন এবং জমি থেকে ঠান্ডা পানি সরিয়ে দিন।',
    },
  },
};

/** 1 bigha (33 decimals) in square metres and hectares. */
export const BIGHA_M2 = 1337.8;
export const BIGHA_HA = BIGHA_M2 / 10000;
export const BIGHA_ACRE = 0.33;
