export type Lang = 'en' | 'bn';
export type Theme = 'day' | 'night';
export type Role = 'farmer' | 'admin';

export interface User {
  name: string;
  email: string;
  phone: string;
  initials: string;
  role: Role;
}

export type TabId =
  | 'rotation'
  | 'whatif'
  | 'analytics'
  | 'nasa'
  | 'farm_profile'
  | 'user_account'
  | 'settings'
  | 'admin'
  | 'report';

export type SoilTexture =
  | 'sand'
  | 'sandy_loam'
  | 'loam'
  | 'silt_loam'
  | 'clay_loam'
  | 'clay'
  | 'peat';

export type IrrigationType = 'deep_tw' | 'shallow_tw' | 'canal' | 'rainfed';

export interface FarmProfile {
  sizeBigha: number;
  texture: SoilTexture;
  ph: number;
  organicMatter: number; // percent
  irrigation: IrrigationType;
}

export interface SimSettings {
  rainDelta: number;     // % change in rainfall
  tempDelta: number;     // °C increase
  irrigationCut: number; // % less irrigation water available
}

export type AlertType = 'drought' | 'salinity' | 'flood' | 'cold';

export interface BroadcastAlert {
  id: string;
  division: string;
  type: AlertType;
  note: string;
  sentAt: number;
  sentBy: string;
}

/** A piece of text in both languages. */
export interface Bi {
  en: string;
  bn: string;
}
