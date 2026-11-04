import type { Bi, Lang } from './types';

/** Pick the English or Bangla string. */
export const tr = (lang: Lang, en: string, bn: string) => (lang === 'bn' ? bn : en);

export const pick = (lang: Lang, text: Bi) => (lang === 'bn' ? text.bn : text.en);

/** Format a number with an explicit + sign when positive. */
export const signed = (n: number, digits = 0) => {
  const v = Number(n.toFixed(digits));
  return v > 0 ? `+${v.toLocaleString('en-US')}` : v.toLocaleString('en-US');
};
