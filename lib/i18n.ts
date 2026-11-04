import type { Bi, Lang } from './types';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/** Replace 0–9 with Bangla digits (০–৯). */
export const toBnDigits = (text: string) => text.replace(/[0-9]/g, d => BN_DIGITS[Number(d)]);

/** Use Bangla digits when the language is Bangla. */
export const localDigits = (lang: Lang, text: string) => (lang === 'bn' ? toBnDigits(text) : text);

/** Pick the English or Bangla string. Numbers in the Bangla string are shown in Bangla digits. */
export const tr = (lang: Lang, en: string, bn: string) => (lang === 'bn' ? toBnDigits(bn) : en);

export const pick = (lang: Lang, text: Bi) => (lang === 'bn' ? toBnDigits(text.bn) : text.en);

/** Format a number with thousands separators, in the current language's digits. */
export const formatNum = (lang: Lang, n: number, digits = 0) =>
  localDigits(lang, Number(n.toFixed(digits)).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }));

/** Format a number with an explicit + sign when positive. */
export const signed = (n: number, digits = 0, lang: Lang = 'en') => {
  const v = Number(n.toFixed(digits));
  const text = v > 0 ? `+${v.toLocaleString('en-US')}` : v.toLocaleString('en-US');
  return localDigits(lang, text);
};
