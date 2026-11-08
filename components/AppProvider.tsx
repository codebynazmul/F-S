'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ALL_DISTRICTS, type DistrictData } from '@/data/districts';
import { CROP_DATABASE } from '@/data/crops';
import { usePersistentState } from '@/lib/storage';
import { calculatePlanMetrics, type PlanMetrics } from '@/lib/metrics';
import { recommendPlan, type Recommendation } from '@/lib/recommend';
import { formatNum, localDigits, tr } from '@/lib/i18n';
import { accountFromProfile, userFromProfile } from '@/lib/auth';
import { supabase, type ProfileRow } from '@/lib/supabase';
import { loadDistrictClimate, type ClimateStatus, type DistrictClimate } from '@/lib/climate';
import { useFarmSync, type FarmSyncStatus } from './useFarmSync';
import type {
  Account, AdminAction, AdminLogEntry, FarmProfile, IrrigationType, Lang, Role, SimSettings, SoilTexture, TabId, Theme, User,
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
const isRecord = <T,>(v: unknown): v is Record<string, T> => typeof v === 'object' && v !== null && !Array.isArray(v);
const MAX_LOG = 500;

/** Why the login screen is showing a message after an automatic sign-out. */
export type AuthNotice = 'blocked' | 'profile-error';

export type PasswordChangeResult = 'ok' | 'wrong-password' | 'no-password' | 'error';

/**
 * Actions only an admin can run. Each one is written to the activity log.
 * The database's row-level security enforces the same rules, so hiding the
 * admin tab is only for convenience.
 */
export interface AdminActions {
  updateAccount: (id: string, patch: { name?: string; phone?: string }) => Promise<void>;
  setBlocked: (id: string, blocked: boolean) => Promise<void>;
  setRole: (id: string, role: Role) => Promise<void>;
  /** Changes the signed-in admin's own password after checking the current one. */
  changePassword: (current: string, next: string) => Promise<PasswordChangeResult>;
  recordExport: () => Promise<void>;
  clearLog: () => Promise<void>;
  reload: () => Promise<void>;
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
  signOut: () => Promise<void>;
  /** Saves the signed-in user's own name and phone. Returns false if saving failed. */
  updateUser: (patch: { name?: string; phone?: string }) => Promise<boolean>;
  /** Message for the login screen after an automatic sign-out. */
  authNotice: AuthNotice | null;
  clearAuthNotice: () => void;
  /** True after the person opened a password-reset link; they must choose a new password. */
  passwordRecovery: boolean;
  finishPasswordRecovery: () => void;

  /** True once the first-time setup has been finished or skipped on this device. */
  onboarded: boolean;
  finishOnboarding: () => void;

  activeTab: TabId; setActiveTab: (t: TabId) => void;
  menuOpen: boolean; setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;

  /**
   * The selected district. When NASA data has been synced, its rainfall and temperature
   * are the NASA POWER 30-year averages; otherwise the static values from data/districts.ts.
   */
  district: DistrictData;
  /** The district exactly as in data/districts.ts. */
  districtBaseline: DistrictData;
  setDistrictId: (id: string) => void;
  /** NASA data for the selected district (may be an offline copy). */
  climate: DistrictClimate | null;
  climateStatus: ClimateStatus;
  retryClimate: () => void;
  /** Where the district's rainfall and temperature come from. */
  climateSource: 'nasa' | 'baseline';

  farm: FarmProfile;
  updateFarm: (patch: Partial<FarmProfile>) => void;
  /** Whether the farm and plan are saved to the person's account. */
  farmSyncStatus: FarmSyncStatus;

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

  /** Every account, loaded from Supabase for admins (empty for farmers). */
  accounts: Account[];
  adminLog: AdminLogEntry[];
  /** The last admin action that failed, shown in the admin panel. */
  adminError: string | null;
  clearAdminError: () => void;
  admin: AdminActions;
}

/** Rows as the admin panel reads them. */
interface FarmRow {
  user_id: string;
  district_id: string;
  size_bigha: number;
  texture: SoilTexture;
  ph: number;
  organic_matter: number;
  irrigation: IrrigationType;
}
interface LogRow {
  id: string;
  action: AdminAction;
  target: string | null;
  created_at: string;
  actor: { name: string; email: string | null } | { name: string; email: string | null }[] | null;
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
  // Last known profile, so the app can still open offline. Supabase holds the real session.
  const [user, setUser, l3] = usePersistentState<User | null>('user', null, isUser);
  const [activeTab, setActiveTab, l4] = usePersistentState<TabId>('tab', 'rotation', isTabId);
  const [districtId, setDistrictId, l5] = usePersistentState<string>('district', 'rajshahi', isDistrictId);
  const [farm, setFarm, l6] = usePersistentState<FarmProfile>('farm', DEFAULT_FARM, isRecord as (v: unknown) => v is FarmProfile);
  const [traditionalPlan, setTraditionalPlan, l7] = usePersistentState<string[]>('traditional-plan', DEFAULT_TRADITIONAL, isPlan);
  const [planOverrides, setPlanOverrides, l8] = usePersistentState<Record<string, string[]>>('plan-overrides', {}, isRecord);
  const [onboarded, setOnboarded, l9] = usePersistentState<boolean>('onboarded', false, (v): v is boolean => typeof v === 'boolean');
  // Offline copy of NASA data per district, so recommendations still use it without internet.
  const [climateCache, setClimateCache, l10] = usePersistentState<Record<string, DistrictClimate>>('climate', {}, isRecord);
  const prefsReady = l1 && l2 && l3 && l4 && l5 && l6 && l7 && l8 && l9 && l10;

  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [authNotice, setAuthNotice] = useState<AuthNotice | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [adminLog, setAdminLog] = useState<AdminLogEntry[]>([]);
  const [adminError, setAdminError] = useState<string | null>(null);

  const ready = prefsReady && authReady && profileReady;
  const isAdmin = !!user && user.id === sessionUserId && user.role === 'admin';

  const [menuOpen, setMenuOpen] = useState(false);
  const [sim, setSim] = useState<SimSettings>(DEFAULT_SIM);

  // Keep <html data-theme> and <html lang> in sync.
  useEffect(() => {
    if (!l2) return;
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme, l2]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const districtBaseline = useMemo(
    () => ALL_DISTRICTS.find(d => d.id === districtId) ?? ALL_DISTRICTS[0],
    [districtId]
  );

  // ---------- NASA climate (from our database, filled by the sync-power function) ----------

  const [climateStatus, setClimateStatus] = useState<ClimateStatus>('loading');
  const [climateAttempt, setClimateAttempt] = useState(0);
  useEffect(() => {
    if (!l5 || !l10) return;
    let cancelled = false;
    const id = districtBaseline.id;
    setClimateStatus('loading');
    loadDistrictClimate(id)
      .then(c => {
        if (cancelled) return;
        setClimateCache(prev => ({ ...prev, [id]: c }));
        setClimateStatus(c.normals ? 'ok' : 'missing');
      })
      .catch(() => { if (!cancelled) setClimateStatus('error'); });
    return () => { cancelled = true; };
  }, [districtBaseline.id, l5, l10, climateAttempt, setClimateCache]);

  const climate = climateCache[districtBaseline.id] ?? null;
  const normals = climate?.normals ?? null;
  const district = useMemo<DistrictData>(
    () => (normals ? { ...districtBaseline, rainfall: normals.annualRainMm, temp: normals.tempMean } : districtBaseline),
    [districtBaseline, normals]
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


  // ---------- Session ----------

  // Follow Supabase's session. Only set state in the listener: calling Supabase
  // from inside it can deadlock.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionUserId(data.session?.user.id ?? null);
      setAuthReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSessionUserId(session?.user.id ?? null);
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const logAction = useCallback(async (actorId: string, action: AdminAction, target?: string) => {
    await supabase.from('activity_log').insert({ actor_id: actorId, action, target: target ?? null });
  }, []);

  // Load the profile whenever the signed-in person changes.
  const hadNoUser = useRef(false);
  useEffect(() => {
    if (!authReady || !prefsReady) return;
    if (!sessionUserId) {
      setUser(null);
      setProfileReady(true);
      hadNoUser.current = true;
      return;
    }
    let cancelled = false;
    setProfileReady(false);
    supabase.from('profiles').select('*').eq('id', sessionUserId).single<ProfileRow>().then(({ data, error }) => {
      if (cancelled) return;
      if (data?.blocked) {
        setAuthNotice('blocked');
        supabase.auth.signOut({ scope: 'local' });
        return;
      }
      if (data) {
        const fresh = userFromProfile(data);
        setUser(fresh);
        // A sign-in that happened on this page (not a restored session): open the right tab.
        if (hadNoUser.current) {
          hadNoUser.current = false;
          setMenuOpen(false);
          setActiveTab(fresh.role === 'admin' ? 'admin' : 'rotation');
          if (fresh.role === 'admin') logAction(fresh.id, 'login');
        }
      } else if (!(user && user.id === sessionUserId)) {
        // No profile and nothing cached for this person (offline on first use, or a server error).
        setAuthNotice('profile-error');
        console.error('Could not load profile', error);
        supabase.auth.signOut({ scope: 'local' });
        return;
      }
      // Otherwise keep the cached profile, e.g. when offline.
      setProfileReady(true);
    });
    return () => { cancelled = true; };
    // `user` is only read as an offline fallback; reloading on its changes would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, prefsReady, sessionUserId, logAction, setUser, setActiveTab]);

  // Re-check the account when the person comes back to the app, so a block or role
  // change made by an admin takes effect without a reload.
  useEffect(() => {
    if (!sessionUserId) return;
    const recheck = async () => {
      if (document.visibilityState !== 'visible') return;
      const { data } = await supabase.from('profiles').select('*').eq('id', sessionUserId).maybeSingle<ProfileRow>();
      if (!data) return; // offline or a server error: keep the current state
      if (data.blocked) {
        setAuthNotice('blocked');
        await supabase.auth.signOut({ scope: 'local' });
        return;
      }
      setUser(userFromProfile(data));
    };
    document.addEventListener('visibilitychange', recheck);
    return () => document.removeEventListener('visibilitychange', recheck);
  }, [sessionUserId, setUser]);

  const signOut = useCallback(async () => {
    if (isAdmin && user) await logAction(user.id, 'logout');
    await supabase.auth.signOut({ scope: 'local' });
    setUser(null);
    setMenuOpen(false);
    setActiveTab('rotation');
  }, [isAdmin, user, logAction, setUser, setActiveTab]);

  const updateUser = async (patch: { name?: string; phone?: string }) => {
    if (!user) return false;
    const row: { name?: string; phone?: string | null } = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.phone !== undefined) row.phone = patch.phone === '—' ? null : patch.phone;
    const { data, error } = await supabase.from('profiles').update(row).eq('id', user.id).select().single<ProfileRow>();
    if (error || !data) return false;
    setUser(userFromProfile(data));
    return true;
  };

  // ---------- Admin data ----------

  const loadAdminData = useCallback(async () => {
    const [profiles, farms, log] = await Promise.all([
      supabase.from('profiles').select('*').returns<ProfileRow[]>(),
      supabase.from('farms')
        .select('user_id, district_id, size_bigha, texture, ph, organic_matter, irrigation')
        .order('updated_at', { ascending: false })
        .returns<FarmRow[]>(),
      supabase.from('activity_log')
        .select('id, action, target, created_at, actor:profiles(name, email)')
        .order('created_at', { ascending: false })
        .limit(MAX_LOG)
        .returns<LogRow[]>(),
    ]);
    const firstError = profiles.error ?? farms.error ?? log.error;
    if (firstError) setAdminError(firstError.message);

    // Newest farm per person, for the admin statistics.
    const farmOf = new Map<string, Pick<Account, 'districtId' | 'farm'>>();
    for (const f of farms.data ?? []) {
      if (farmOf.has(f.user_id)) continue;
      farmOf.set(f.user_id, {
        districtId: f.district_id,
        farm: { sizeBigha: f.size_bigha, texture: f.texture, ph: f.ph, organicMatter: f.organic_matter, irrigation: f.irrigation },
      });
    }
    setAccounts((profiles.data ?? []).map(p => accountFromProfile(p, farmOf.get(p.id))));
    setAdminLog((log.data ?? []).map(e => {
      const actor = Array.isArray(e.actor) ? e.actor[0] : e.actor;
      return {
        id: e.id,
        at: Date.parse(e.created_at),
        actor: actor?.email || actor?.name || '—',
        action: e.action,
        target: e.target ?? undefined,
      };
    }));
  }, []);

  useEffect(() => {
    if (isAdmin) loadAdminData();
    else { setAccounts([]); setAdminLog([]); }
  }, [isAdmin, loadAdminData]);

  // ---------- Admin actions ----------

  const labelOf = (id: string) => {
    const a = accounts.find(x => x.id === id);
    return a ? (a.email !== '—' ? a.email : a.name) : id;
  };

  /** Runs a change for an admin acting on someone else, logs it, then reloads the lists. */
  const adminChange = async (
    id: string,
    change: () => PromiseLike<{ error: { message: string } | null }>,
    action: AdminAction,
  ) => {
    if (!isAdmin || !user || id === user.id) return;
    const { error } = await change();
    if (error) { setAdminError(error.message); return; }
    await logAction(user.id, action, labelOf(id));
    await loadAdminData();
  };

  const admin: AdminActions = {
    updateAccount: (id, patch) => adminChange(id, () => supabase.from('profiles').update({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.phone !== undefined && { phone: patch.phone === '—' ? null : patch.phone }),
    }).eq('id', id), 'edit_user'),
    setBlocked: (id, blocked) => adminChange(id,
      () => supabase.from('profiles').update({ blocked }).eq('id', id), blocked ? 'block_user' : 'unblock_user'),
    setRole: (id, role) => adminChange(id,
      () => supabase.from('profiles').update({ role }).eq('id', id), role === 'admin' ? 'make_admin' : 'remove_admin'),
    changePassword: async (current, next) => {
      if (!isAdmin || !user) return 'error';
      const self = accounts.find(a => a.id === user.id);
      if (self && self.method !== 'email') return 'no-password';
      // Supabase does not check the old password itself, so confirm it first.
      const check = await supabase.auth.signInWithPassword({ email: user.email, password: current });
      if (check.error) return 'wrong-password';
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) { setAdminError(error.message); return 'error'; }
      await logAction(user.id, 'change_password', user.email);
      await loadAdminData();
      return 'ok';
    },
    recordExport: async () => {
      if (!isAdmin || !user) return;
      await logAction(user.id, 'export_users');
      await loadAdminData();
    },
    clearLog: async () => {
      if (!isAdmin || !user) return;
      const { error } = await supabase.from('activity_log').delete().not('id', 'is', null);
      if (error) { setAdminError(error.message); return; }
      await logAction(user.id, 'clear_log');
      await loadAdminData();
    },
    reload: loadAdminData,
  };

  // ---------- Farm and plan sync (Supabase) ----------

  const farmSyncStatus = useFarmSync({
    userId: user && user.id === sessionUserId ? user.id : null,
    ready,
    onboarded,
    setOnboarded,
    districtId: district.id,
    setDistrictId,
    farm: safeFarm,
    setFarm,
    recommendedPlan,
    traditionalPlan,
    isCustomPlan,
    setTraditionalPlan,
    setPlanOverride: (id, plan) => setPlanOverrides(prev => ({ ...prev, [id]: plan })),
    isPlan,
    risks: recommendation.risks,
    climate,
  });

  const value: AppState = {
    ready,
    lang, setLang,
    t: (en, bn) => tr(lang, en, bn),
    n: (value, digits = 0) => formatNum(lang, value, digits),
    d: (text) => localDigits(lang, text),
    theme, setTheme,
    isNight: theme === 'night',

    // Only trust the cached profile while Supabase has a session for the same person.
    user: user && user.id === sessionUserId ? user : null,
    isAdmin,
    signOut,
    updateUser,
    authNotice,
    clearAuthNotice: () => setAuthNotice(null),
    passwordRecovery,
    finishPasswordRecovery: () => setPasswordRecovery(false),

    onboarded,
    finishOnboarding: () => { setOnboarded(true); setActiveTab('rotation'); },

    activeTab: activeTab === 'admin' && !isAdmin ? 'rotation' : activeTab,
    setActiveTab,
    menuOpen, setMenuOpen,

    district,
    districtBaseline,
    setDistrictId,
    climate,
    climateStatus,
    retryClimate: () => setClimateAttempt(a => a + 1),
    climateSource: normals ? 'nasa' : 'baseline',

    farm: safeFarm,
    updateFarm: (patch) => setFarm(prev => ({ ...DEFAULT_FARM, ...prev, ...patch })),
    farmSyncStatus,

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
    adminError,
    clearAdminError: () => setAdminError(null),
    admin,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
