// --- CROP DATABASE WITH BANGLA TRANSLATIONS ---
export interface CropInfo {
  id: string;
  name: string;
  nameBn: string;
  family: string;
  familyBn: string;
  category: string;
  categoryBn: string;
  waterDemand: string;
  waterDemandBn: string;
  waterMm: number;
  nutrientDemand: string;
  nutrientDemandBn: string
  nBalanceKgHa: number;
  rootingDepth: string;
  rootingDepthBn: string;
  heatTolerance: string;
  droughtTolerance: string;
  growingPeriodDays: number;
  carbonScore: number;
}

export const CROP_DATABASE: Record<string, CropInfo> = {
  rice_boro: {
    id: 'rice_boro',
    name: 'Boro Rice (High-Yield Paddy)',
    nameBn: 'বোরো ধান (উচ্চ ফলনশীল)',
    family: 'Poaceae',
    familyBn: 'ঘাস জাতীয়',
    category: 'Cereal',
    categoryBn: 'দানাশস্য',
    waterDemand: 'Very High',
    waterDemandBn: 'চরম মাত্রার পানি',
    waterMm: 1250,
    nutrientDemand: 'Heavy Depleter (NPK)',
    nutrientDemandBn: 'মাটির সার অপচয়কারী',
    nBalanceKgHa: -95,
    rootingDepth: 'Shallow (0-25cm)',
    rootingDepthBn: 'অগভীর শিকড় (০-২৫ সেমি)',
    heatTolerance: 'Medium',
    droughtTolerance: 'Low',
    growingPeriodDays: 145,
    carbonScore: 3
  },
  rice_aman: {
    id: 'rice_aman',
    name: 'Ropa Aman (Rainfed Rice)',
    nameBn: 'রোপা আমন ধান (বৃষ্টি নির্ভর)',
    family: 'Poaceae',
    familyBn: 'ঘাস জাতীয়',
    category: 'Cereal',
    categoryBn: 'দানাশস্য',
    waterDemand: 'High',
    waterDemandBn: 'উচ্চ পানি',
    waterMm: 750,
    nutrientDemand: 'Depleter',
    nutrientDemandBn: 'পুষ্টি ক্ষয়কারী',
    nBalanceKgHa: -65,
    rootingDepth: 'Shallow (0-30cm)',
    rootingDepthBn: 'অগভীর শিকড় (০-৩০ সেমি)',
    heatTolerance: 'High',
    droughtTolerance: 'Medium',
    growingPeriodDays: 130,
    carbonScore: 4
  },
  wheat: {
    id: 'wheat',
    name: 'Wheat (Gom)',
    nameBn: 'গম (বারি গম ৩৩)',
    family: 'Poaceae',
    familyBn: 'ঘাস জাতীয়',
    category: 'Cereal',
    categoryBn: 'দানাশস্য',
    waterDemand: 'Medium',
    waterDemandBn: 'মাঝারি পানি',
    waterMm: 380,
    nutrientDemand: 'Moderate Depleter',
    nutrientDemandBn: 'মাঝারি সার গ্রহণকারী',
    nBalanceKgHa: -50,
    rootingDepth: 'Medium (30-60cm)',
    rootingDepthBn: 'মাঝারি শিকড় (৩০-৬০ সেমি)',
    heatTolerance: 'Low',
    droughtTolerance: 'Medium',
    growingPeriodDays: 110,
    carbonScore: 5
  },
  lentil: {
    id: 'lentil',
    name: 'Lentil (Masoor Dal)',
    nameBn: 'মসুর ডাল (বারি মসুর ৮)',
    family: 'Fabaceae (Legume)',
    familyBn: 'শিম্বী জাতীয় (ডাল)',
    category: 'Legume',
    categoryBn: 'ডাল ও নাইট্রোজেন সংগ্রাহক',
    waterDemand: 'Low',
    waterDemandBn: 'খুব কম পানি',
    waterMm: 210,
    nutrientDemand: 'Restorer (Fixes Nitrogen)',
    nutrientDemandBn: 'নাইট্রোজেন উৎপাদক (জমি উর্বর করে)',
    nBalanceKgHa: +45,
    rootingDepth: 'Medium (30-60cm)',
    rootingDepthBn: 'মাঝারি শিকড় (৩০-৬০ সেমি)',
    heatTolerance: 'Medium',
    droughtTolerance: 'High',
    growingPeriodDays: 95,
    carbonScore: 8
  },
  chickpea: {
    id: 'chickpea',
    name: 'Chickpea (Chhola)',
    nameBn: 'ছোলা (বরেন্দ্র উপযোগী)',
    family: 'Fabaceae (Legume)',
    familyBn: 'শিম্বী জাতীয় (ডাল)',
    category: 'Legume',
    categoryBn: 'ডাল ও নাইট্রোজেন সংগ্রাহক',
    waterDemand: 'Low',
    waterDemandBn: 'খুব কম পানি',
    waterMm: 230,
    nutrientDemand: 'Restorer (Fixes Nitrogen)',
    nutrientDemandBn: 'প্রাকৃতিক নাইট্রোজেন উৎপাদক',
    nBalanceKgHa: +55,
    rootingDepth: 'Deep Taproot (70-130cm)',
    rootingDepthBn: 'গভীর প্রধান শিকড় (৭০-১৩০ সেমি)',
    heatTolerance: 'High',
    droughtTolerance: 'High',
    growingPeriodDays: 100,
    carbonScore: 8
  },
  mustard: {
    id: 'mustard',
    name: 'Mustard (Shorisha)',
    nameBn: 'সরিষা (বারি সরিষা ১৪/১৭)',
    family: 'Brassicaceae',
    familyBn: 'সরিষা জাতীয়',
    category: 'Oilseed',
    categoryBn: 'তৈলবীজ',
    waterDemand: 'Low',
    waterDemandBn: 'স্বল্প পানি',
    waterMm: 250,
    nutrientDemand: 'Light',
    nutrientDemandBn: 'স্বল্প সার গ্রহণকারী',
    nBalanceKgHa: -30,
    rootingDepth: 'Medium (30-60cm)',
    rootingDepthBn: 'মাঝারি শিকড়',
    heatTolerance: 'Medium',
    droughtTolerance: 'Medium',
    growingPeriodDays: 80,
    carbonScore: 6
  },
  maize: {
    id: 'maize',
    name: 'Hybrid Maize (Bhutta)',
    nameBn: 'হাইব্রিড ভুট্টা',
    family: 'Poaceae',
    familyBn: 'ঘাস জাতীয়',
    category: 'Cereal',
    categoryBn: 'দানাশস্য',
    waterDemand: 'Medium',
    waterDemandBn: 'মাঝারি পানি',
    waterMm: 490,
    nutrientDemand: 'Heavy Depleter',
    nutrientDemandBn: 'উচ্চ সার গ্রহণকারী',
    nBalanceKgHa: -75,
    rootingDepth: 'Deep (60-120cm)',
    rootingDepthBn: 'গভীর শিকড় (৬০-১২০ সেমি)',
    heatTolerance: 'High',
    droughtTolerance: 'Medium',
    growingPeriodDays: 120,
    carbonScore: 7
  },
  mungbean: {
    id: 'mungbean',
    name: 'Green Mungbean (Mug Dal)',
    nameBn: 'মুগ ডাল (সবুজ সার)',
    family: 'Fabaceae (Legume)',
    familyBn: 'শিম্বী জাতীয় (ডাল)',
    category: 'Legume / Green Manure',
    categoryBn: 'ডাল ও সবুজ সার',
    waterDemand: 'Low',
    waterDemandBn: 'খুব কম পানি',
    waterMm: 190,
    nutrientDemand: 'Restorer (Fixes Nitrogen)',
    nutrientDemandBn: 'নাইট্রোজেন উৎপাদক ও জৈব সার',
    nBalanceKgHa: +50,
    rootingDepth: 'Medium (30-60cm)',
    rootingDepthBn: 'মাঝারি শিকড়',
    heatTolerance: 'High',
    droughtTolerance: 'High',
    growingPeriodDays: 65,
    carbonScore: 9
  }
};
