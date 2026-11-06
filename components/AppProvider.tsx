'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ALL_DISTRICTS, type DistrictData } from '@/data/districts';
import { CROP_DATABASE } from '@/data/crops';
import { usePersistentState } from '@/lib/storage';
import { calculatePlanMetrics, type PlanMetrics } from '@/lib/metrics';
import { recommendPlan, type Recommendation } from '@/lib/recommend';
import { formatNum, localDigits, tr } from '@/lib/i18n';
import {
  BUILTIN_ADMIN, BUILTIN_ADMIN_ID, DEFAULT_ADMIN_PASSWORD, checkPassword, hashPassword,
  nameFromEmail, newId, userFromAccount,
} from '@/lib/auth';
import type {
  Account, AdminAction, AdminLogEntry, FarmProfile, Lang, Role, SimSettings, TabId, Theme, User,
} from '@/lib/types';

export const DEFAULT_FARM: FarmProfile = {
  sizeBigha: 8.5,
  texture: 'clay_loam',
  ph: 6.5,
  organicMatter: 1.2,
  irrigation: 'deep_tw',
};
export const DEFAULT_SIM: SimSettings = { rainDelta: -25, tempDelta: 1.5, irrigationCut: 35 };
export const DEFAULT_TRADITIONAL = ['rice_boro', 'rice_aman', 'rice_boro', 'rice_aman'];

const isPlan = (v: unknown): v is string[] =>
  Array.isArray(v) && v.length === 4 && v.every(id => typeof id === 'string' && id in CROP_DATABASE);
const isTheme = (v: unknown): v is Theme => v === 'day' || v === 'night';
const isLang = (v: unknown): v is Lang => v === 'en' || v === 'bn';
const isDistrictId = (v: unknown): v is string => ALL_DISTRICTS.some(d => d.id === v);
const TAB_IDS: TabId[] = ['rotation', 'whatif', 'analytics', 'nasa', 'farm_profile', 'user_account', 'settings', 'admin', 'report'];
const isTabId = (v: unknown): v is TabId => TAB_IDS.includes(v as TabId);
// Sessions saved before accounts existed have no id and are not restored.
const isUser = (v: unknown): v is User =>
  typeof v === 'object' && v !== null &&
  typeof (v as User).id === 'string' && ((v as User).role === 'farmer' || (v as User).role === 'admin');
const isList = <T,>(v: unknown): v is T[] => Array.isArray(v);
const MAX_LOG = 500;

export type AuthInput =
  | { kind: 'password'; identifier: string; password: string }
  | { kind: 'phone'; phoneDigits: string }
  | { kind: 'social'; provider: 'google' | 'apple' };
export type AuthResult = 'ok' | 'blocked' | 'wrong-password' | 'exists';

/** Actions only an admin can run. Each one is written to the activity log. */
export interface AdminActions {
  updateAccount: (id: string, patch: { name?: string; phone?: string }) => void;
  setBlocked: (id: string, blocked: boolean) => void;
  setRole: (id: string, role: Role) => void;
  deleteAccount: (id: string) => void;
  /** Changes the signed-in admin's own password. Returns false if the current one is wrong. */
  changePassword: (current: string, next: string) => Promise<boolean>;
  recordExport: () => void;
  clearLog: () => void;
}

interface AppState {
  ready: boolean;
  lang: Lang; setLang: (l: Lang) => void;
  /** Pick English or Bangla text (Bangla gets Bangla digits). */
  t: (en: string, bn: string) => string;
  /** Format a number in the current language's digits. */
  n: (value: number, digits?: number) => string;
  /** Convert the digits in any text to the current language. */
  d: (text: string) => string;
  theme: Theme; setTheme: (t: Theme) => void;
  isNight: boolean;

  user: User | null;
  isAdmin: boolean;
  /** Signs in, creating the account on first use (demo). */
  authenticate: (input: AuthInput) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  signOut: () => void;
  updateUser: (patch: Partial<User>) => void;

  /** True once the first-time setup has been finished or skipped on this device. */
  onboarded: boolean;
  finishOnboarding: () => void;

  activeTab: TabId; setActiveTab: (t: TabId) => void;
  menuOpen: boolean; setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;

  district: DistrictData;
  setDistrictId: (id: string) => void;

  farm: FarmProfile;
  updateFarm: (patch: Partial<FarmProfile>) => void;

  sim: SimSettings;
  setSim: React.Dispatch<React.SetStateAction<SimSettings>>;

  recommendation: Recommendation;
  recommendedPlan: string[];
  isCustomPlan: boolean;
  setRecommendedCrop: (season: number, cropId: string) => void;
  resetRecommendedPlan: () => void;

  traditionalPlan: string[];
  setTraditionalCrop: (season: number, cropId: string) => void;
  resetTraditionalPlan: () => void;

  tradMetrics: PlanMetrics;
  recMetrics: PlanMetrics;
  simTradMetrics: PlanMetrics;
  simRecMetrics: PlanMetrics;

  accounts: Account[];
  adminLog: AdminLogEntry[];
  /** True while the built-in admin still uses the default password. */
  usingDefaultAdminPassword: boolean;
  admin: AdminActions;
}

const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang, l1] = usePersistentState<Lang>('lang', 'en', isLang);
  const [theme, setTheme, l2] = usePersistentState<Theme>('theme', 'day', isTheme);
  const [user, setUser, l3] = usePersistentState<User | null>('user', null, isUser);
  const [activeTab, setActiveTab, l4] = usePersistentState<TabId>('tab', 'rotation', isTabId);
  const [districtId, setDistrictId, l5] = usePersistentState<string>('district', 'rajshahi', isDistrictId);
  const [farm, setFarm, l6] = usePersistentState<FarmProfile>('farm', DEFAULT_FARM);
  const [traditionalPlan, setTraditionalPlan, l7] = usePersistentState<string[]>('traditional-plan', DEFAULT_TRADITIONAL, isPlan);
  const [planOverrides, setPlanOverrides, l8] = usePersistentState<Record<string, string[]>>('plan-overrides', {});
  const [onboarded, setOnboarded, l9] = usePersistentState<boolean>('onboarded', false, (v): v is boolean => typeof v === 'boolean');
  const [accounts, setAccounts, l10] = usePersistentState<Account[]>('accounts', [], isList<Account>);
  const [adminLog, setAdminLog, l11] = usePersistentState<AdminLogEntry[]>('admin-log', [], isList<AdminLogEntry>);
  const [adminPasswordHash, setAdminPasswordHash, l12] = usePersistentState<string | null>('admin-password', null);
  const ready = l1 && l2 && l3 && l4 && l5 && l6 && l7 && l8 && l9 && l10 && l11 && l12;
  const isAdmin = user?.role === 'admin';

  const [menuOpen, setMenuOpen] = useState(false);
  const [sim, setSim] = useState<SimSettings>(DEFAULT_SIM);

  // Keep <html data-theme> and <html lang> in sync.
  useEffect(() => {
    if (!l2) return;
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme, l2]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const district = useMemo(
    () => ALL_DISTRICTS.find(d => d.id === districtId) ?? ALL_DISTRICTS[0],
    [districtId]
  );

  // Fill in any farm fields missing from older saved data.
  const safeFarm = useMemo(() => ({ ...DEFAULT_FARM, ...farm }), [farm]);

  const recommendation = useMemo(() => recommendPlan(district, safeFarm), [district, safeFarm]);
  const override = planOverrides[district.id];
  const recommendedPlan = isPlan(override) ? override : recommendation.plan;
  const isCustomPlan = isPlan(override) && override.join() !== recommendation.plan.join();

  const tradMetrics = useMemo(() => calculatePlanMetrics(traditionalPlan, district, safeFarm), [traditionalPlan, district, safeFarm]);
  const recMetrics = useMemo(() => calculatePlanMetrics(recommendedPlan, district, safeFarm), [recommendedPlan, district, safeFarm]);
  const simTradMetrics = useMemo(() => calculatePlanMetrics(traditionalPlan, district, safeFarm, sim), [traditionalPlan, district, safeFarm, sim]);
  const simRecMetrics = useMemo(() => calculatePlanMetrics(recommendedPlan, district, safeFarm, sim), [recommendedPlan, district, safeFarm, sim]);


  // ---------- Accounts and sign-in ----------

  const addLog = useCallback((actor: string, action: AdminAction, target?: string) => {
    setAdminLog(prev => [{ id: newId(), at: Date.now(), actor, action, target }, ...prev].slice(0, MAX_LOG));
  }, [setAdminLog]);

  const startSession = (u: User) => {
    setUser(u);
    setMenuOpen(false);
    setActiveTab(u.role === 'admin' ? 'admin' : 'rotation');
    if (u.role === 'admin') addLog(u.name, 'login');
  };

  const signOut = useCallback(() => {
    setUser(null);
    setMenuOpen(false);
    setActiveTab('rotation');
  }, [setUser, setActiveTab]);

  /** Signs in an existing account, or creates one. `match` finds the account. */
  const signInAccount = (
    match: (a: Account) => boolean,
    create: () => Omit<Account, 'id' | 'createdAt' | 'lastLoginAt' | 'loginCount' | 'blocked' | 'role'>,
  ): AuthResult => {
    const now = Date.now();
    const existing = accounts.find(match);
    if (existing) {
      if (existing.blocked) return 'blocked';
      // Update from `prev` so changes queued just before (e.g. a new password) are kept.
      setAccounts(prev => prev.map(a => (a.id === existing.id ? { ...a, lastLoginAt: now, loginCount: a.loginCount + 1 } : a)));
      startSession(userFromAccount(existing));
      return 'ok';
    }
    const account: Account = { ...create(), id: newId(), role: 'farmer', blocked: false, createdAt: now, lastLoginAt: now, loginCount: 1 };
    setAccounts(prev => [...prev, account]);
    startSession(userFromAccount(account));
    return 'ok';
  };

  const authenticate = async (input: AuthInput): Promise<AuthResult> => {
    if (input.kind === 'phone') {
      const phone = `+880 ${input.phoneDigits}`;
      return signInAccount(a => a.phone === phone, () => ({
        name: `Farmer ${input.phoneDigits.slice(-4)}`, email: '—', phone, method: 'phone',
      }));
    }
    if (input.kind === 'social') {
      // Demo: no real OAuth, so each provider signs in one sample account.
      const email = input.provider === 'google' ? 'farmer@gmail.com' : 'farmer@icloud.com';
      return signInAccount(a => a.email === email, () => ({
        name: input.provider === 'google' ? 'Google Farmer' : 'Apple Farmer', email, phone: '—', method: input.provider,
      }));
    }

    const id = input.identifier.trim().toLowerCase();
    if (id === BUILTIN_ADMIN_ID) {
      const ok = adminPasswordHash
        ? await checkPassword(input.password, adminPasswordHash)
        : input.password === DEFAULT_ADMIN_PASSWORD;
      if (!ok) {
        addLog(BUILTIN_ADMIN_ID, 'login_failed', BUILTIN_ADMIN_ID);
        return 'wrong-password';
      }
      startSession(BUILTIN_ADMIN);
      return 'ok';
    }

    const existing = accounts.find(a => a.email === id);
    if (existing?.passwordHash && !(await checkPassword(input.password, existing.passwordHash))) {
      if (existing.role === 'admin') addLog(existing.email, 'login_failed', existing.email);
      return 'wrong-password';
    }
    const passwordHash = await hashPassword(input.password);
    if (existing && !existing.passwordHash) {
      // First password sign-in for an account made another way: keep this password.
      setAccounts(prev => prev.map(a => (a.id === existing.id ? { ...a, passwordHash } : a)));
    }
    // Demo: an unknown email creates a new farmer account.
    return signInAccount(a => a.email === id, () => ({
      name: nameFromEmail(id), email: id, phone: '—', method: 'email', passwordHash,
    }));
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    const mail = email.trim().toLowerCase();
    if (mail === BUILTIN_ADMIN_ID || accounts.some(a => a.email === mail)) return 'exists';
    const passwordHash = await hashPassword(password);
    return signInAccount(() => false, () => ({ name: name.trim(), email: mail, phone: '—', method: 'email', passwordHash }));
  };

  // Keep the session in line with the account list: sign out if the account was
  // blocked or deleted, and pick up name or role changes made by an admin.
  useEffect(() => {
    if (!ready || !user || user.id === BUILTIN_ADMIN_ID) return;
    const account = accounts.find(a => a.id === user.id);
    if (!account || account.blocked) { signOut(); return; }
    const fresh = userFromAccount(account);
    if (fresh.name !== user.name || fresh.phone !== user.phone || fresh.role !== user.role) setUser(fresh);
  }, [ready, accounts, user, signOut, setUser]);

  // Remember each person's district and farm so the admin statistics can use them.
  useEffect(() => {
    if (!ready || !user || user.id === BUILTIN_ADMIN_ID) return;
    setAccounts(prev => {
      const i = prev.findIndex(a => a.id === user.id);
      if (i < 0) return prev;
      const a = prev[i];
      if (a.districtId === districtId && JSON.stringify(a.farm) === JSON.stringify(safeFarm)) return prev;
      const next = [...prev];
      next[i] = { ...a, districtId, farm: safeFarm };
      return next;
    });
  }, [ready, user, districtId, safeFarm, setAccounts]);

  // ---------- Admin actions ----------

  const actor = user?.id === BUILTIN_ADMIN_ID ? BUILTIN_ADMIN_ID : user?.email ?? '';
  const labelOf = (id: string) => {
    const a = accounts.find(x => x.id === id);
    return a ? (a.email !== '—' ? a.email : a.phone) : id;
  };
  /** Runs `fn` only for an admin acting on someone other than themselves. */
  const guard = (id: string, fn: () => void) => {
    if (!isAdmin || id === user?.id) return;
    fn();
  };

  const admin: AdminActions = {
    updateAccount: (id, patch) => guard(id, () => {
      setAccounts(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)));
      addLog(actor, 'edit_user', labelOf(id));
    }),
    setBlocked: (id, blocked) => guard(id, () => {
      setAccounts(prev => prev.map(a => (a.id === id ? { ...a, blocked } : a)));
      addLog(actor, blocked ? 'block_user' : 'unblock_user', labelOf(id));
    }),
    setRole: (id, role) => guard(id, () => {
      setAccounts(prev => prev.map(a => (a.id === id ? { ...a, role } : a)));
      addLog(actor, role === 'admin' ? 'make_admin' : 'remove_admin', labelOf(id));
    }),
    deleteAccount: (id) => guard(id, () => {
      addLog(actor, 'delete_user', labelOf(id));
      setAccounts(prev => prev.filter(a => a.id !== id));
    }),
    changePassword: async (current, next) => {
      if (!isAdmin || !user) return false;
      if (user.id === BUILTIN_ADMIN_ID) {
        const ok = adminPasswordHash ? await checkPassword(current, adminPasswordHash) : current === DEFAULT_ADMIN_PASSWORD;
        if (!ok) return false;
        setAdminPasswordHash(await hashPassword(next));
      } else {
        const account = accounts.find(a => a.id === user.id);
        if (!account?.passwordHash || !(await checkPassword(current, account.passwordHash))) return false;
        const passwordHash = await hashPassword(next);
        setAccounts(prev => prev.map(a => (a.id === user.id ? { ...a, passwordHash } : a)));
      }
      addLog(actor, 'change_password', actor);
      return true;
    },
    recordExport: () => { if (isAdmin) addLog(actor, 'export_users'); },
    clearLog: () => {
      if (!isAdmin) return;
      setAdminLog([{ id: newId(), at: Date.now(), actor, action: 'clear_log' }]);
    },
  };

  const value: AppState = {
    ready,
    lang, setLang,
    t: (en, bn) => tr(lang, en, bn),
    n: (value, digits = 0) => formatNum(lang, value, digits),
    d: (text) => localDigits(lang, text),
    theme, setTheme,
    isNight: theme === 'night',

    user,
    isAdmin,
    authenticate,
    register,
    signOut: () => {
      if (isAdmin && user) addLog(actor, 'logout');
      signOut();
    },
    updateUser: (patch) => {
      setUser(prev => (prev ? { ...prev, ...patch } : prev));
      if (user && user.id !== BUILTIN_ADMIN_ID) {
        const { name, phone } = patch;
        setAccounts(prev => prev.map(a => (a.id === user.id
          ? { ...a, ...(name !== undefined && { name }), ...(phone !== undefined && { phone }) }
          : a)));
      }
    },

    onboarded,
    finishOnboarding: () => { setOnboarded(true); setActiveTab('rotation'); },

    activeTab: activeTab === 'admin' && !isAdmin ? 'rotation' : activeTab,
    setActiveTab,
    menuOpen, setMenuOpen,

    district,
    setDistrictId,

    farm: safeFarm,
    updateFarm: (patch) => setFarm(prev => ({ ...DEFAULT_FARM, ...prev, ...patch })),

    sim, setSim,

    recommendation,
    recommendedPlan,
    isCustomPlan,
    setRecommendedCrop: (season, cropId) =>
      setPlanOverrides(prev => {
        const next = [...recommendedPlan];
        next[season] = cropId;
        return { ...prev, [district.id]: next };
      }),
    resetRecommendedPlan: () =>
      setPlanOverrides(prev => {
        const { [district.id]: _removed, ...rest } = prev;
        return rest;
      }),

    traditionalPlan,
    setTraditionalCrop: (season, cropId) =>
      setTraditionalPlan(prev => prev.map((c, i) => (i === season ? cropId : c))),
    resetTraditionalPlan: () => setTraditionalPlan(DEFAULT_TRADITIONAL),

    tradMetrics, recMetrics, simTradMetrics, simRecMetrics,

    accounts,
    adminLog,
    usingDefaultAdminPassword: user?.id === BUILTIN_ADMIN_ID && !adminPasswordHash,
    admin,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
