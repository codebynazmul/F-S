export type Lang = 'en' | 'bn';
export type Theme = 'day' | 'night';
export type Role = 'farmer' | 'admin';
export type SignInMethod = 'email' | 'phone' | 'google' | 'apple';

/** The signed-in person for this browser session. */
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  role: Role;
}

/** A registered account, as shown in the admin panel (from public.profiles). */
export interface Account {
  id: string;
  name: string;
  email: string;
  phone: string;
  method: SignInMethod;
  role: Role;
  blocked: boolean;
  createdAt: number;
  lastLoginAt: number;
  loginCount: number;
  /** Last district and farm this person used, for admin statistics. */
  districtId?: string;
  farm?: FarmProfile;
}

export type AdminAction =
  | 'login'
  | 'login_failed'
  | 'logout'
  | 'edit_user'
  | 'block_user'
  | 'unblock_user'
  | 'delete_user'
  | 'make_admin'
  | 'remove_admin'
  | 'change_password'
  | 'export_users'
  | 'clear_log';

export interface AdminLogEntry {
  id: string;
  at: number;
  /** Who did it (name or email). */
  actor: string;
  action: AdminAction;
  /** Who or what it was done to. */
  target?: string;
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

/** What the farmer cares about most when choosing a rotation. */
export type Priority = 'water' | 'soil' | 'income' | 'forage' | 'resilience';

export interface SimSettings {
  rainDelta: number;     // % change in rainfall
  tempDelta: number;     // °C increase
  irrigationCut: number; // % less irrigation water available
}

/** A piece of text in both languages. */
export interface Bi {
  en: string;
  bn: string;
}
