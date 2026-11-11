'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ALL_DISTRICTS, type DistrictData } from '@/data/districts';
import { CROP_DATABASE } from '@/data/crops';
import { usePersistentState } from '@/lib/storage';
import { calculatePlanMetrics, type PlanMetrics } from '@/lib/metrics';
import { recommendPlan, type Recommendation, type Strategy } from '@/lib/recommend';
import { DEFAULT_FARM, PRIORITIES } from '@/lib/options';
import { formatNum, localDigits, tr } from '@/lib/i18n';
import { initialsOf } from '@/lib/auth';
import { nearestDistrict, type LocationStatus } from '@/lib/geo';
import { loadDistrictClimate, type ClimateStatus, type DistrictClimate } from '@/lib/climate';
import type { FarmProfile, Lang, Priority, SimSettings, TabId, Theme, User } from '@/lib/types';

export { DEFAULT_FARM };
export const DEFAULT_SIM: SimSettings = { rainDelta: -25, tempDelta: 1.5, irrigationCut: 35 };
export const DEFAULT_TRADITIONAL = ['rice_boro', 'rice_aman', 'rice_boro', 'rice_aman'];

const isPlan = (v: unknown): v is string[] =>
  Array.isArray(v) && v.length === 4 && v.every(id => typeof id === 'string' && id in CROP_DATABASE);
const isPriorityList = (v: unknown): v is Priority[] =>
  Array.isArray(v) && v.every(p => PRIORITIES.some(x => x.id === p));
const isTheme = (v: unknown): v is Theme => v === 'day' || v === 'night';
const isLang = (v: unknown): v is Lang => v === 'en' || v === 'bn';
const isDistrictId = (v: unknown): v is string => ALL_DISTRICTS.some(d => d.id === v);
const TAB_IDS: TabId[] = ['rotation', 'whatif', 'analytics', 'nasa', 'farm_profile', 'report'];
const isTabId = (v: unknown): v is TabId => TAB_IDS.includes(v as TabId);
/** There are no accounts: the person's profile lives only on this device. */
const LOCAL_USER_ID = 'local';
// Profiles saved by the old sign-in system have a different id and are not restored.
const isUser = (v: unknown): v is User =>
  typeof v === 'object' && v !== null && (v as User).id === LOCAL_USER_ID && typeof (v as User).name === 'string';
const isRecord = <T,>(v: unknown): v is Record<string, T> => typeof v === 'object' && v !== null && !Array.isArray(v);

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

  /** The person's profile on this device; null until they first press "Get started". */
  user: User | null;
  /** False until "Get started" is pressed. The welcome screen shows on every visit. */
  entered: boolean;
  /** Creates (or renames) the local profile and leaves the welcome screen. */
  getStarted: (name: string) => void;

  /** Location lookup, asked for automatically when the site opens. */
  locationStatus: LocationStatus;
  /** The district nearest to the person's location, once found. */
  nearbyDistrictId: string | null;
  /** Asks for the location again. With `apply`, the nearest district is selected. */
  locate: (apply: boolean) => void;
  /** Saves the person's own name and phone on this device. */
  updateUser: (patch: { name?: string; phone?: string }) => Promise<boolean>;

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

  sim: SimSettings;
  setSim: React.Dispatch<React.SetStateAction<SimSettings>>;

  recommendation: Recommendation;
  /** What the farmer cares about most; ranks the strategies. Empty = balanced. */
  priorities: Priority[];
  togglePriority: (p: Priority) => void;
  /** The strategy that matches the plan in use, or null when the farmer edited it. */
  chosenStrategy: Strategy | null;
  /** Use one of the suggested strategies as the plan. */
  applyStrategy: (plan: string[]) => void;
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

}

const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang, l1] = usePersistentState<Lang>('lang', 'en', isLang);
  // The person's profile, kept on this device only.
  const [theme, setTheme, l2] = usePersistentState<Theme>('theme', 'day', isTheme);
  const [user, setUser, l3] = usePersistentState<User | null>('user', null, isUser);
  const [activeTab, setActiveTab, l4] = usePersistentState<TabId>('tab', 'rotation', isTabId);
  const [districtId, setDistrictId, l5] = usePersistentState<string>('district', 'rajshahi', isDistrictId);
  const [farm, setFarm, l6] = usePersistentState<FarmProfile>('farm', DEFAULT_FARM, isRecord as (v: unknown) => v is FarmProfile);
  const [traditionalPlan, setTraditionalPlan, l7] = usePersistentState<string[]>('traditional-plan', DEFAULT_TRADITIONAL, isPlan);
  const [planOverrides, setPlanOverrides, l8] = usePersistentState<Record<string, string[]>>('plan-overrides', {}, isRecord);
  const [onboarded, setOnboarded, l9] = usePersistentState<boolean>('onboarded', false, (v): v is boolean => typeof v === 'boolean');
  // Offline copy of NASA data per district, so recommendations still use it without internet.
  const [climateCache, setClimateCache, l10] = usePersistentState<Record<string, DistrictClimate>>('climate', {}, isRecord);
  const [priorities, setPriorities, l11] = usePersistentState<Priority[]>('priorities', [], isPriorityList);
  const ready = l1 && l2 && l3 && l4 && l5 && l6 && l7 && l8 && l9 && l10 && l11;

  const [menuOpen, setMenuOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [nearbyDistrictId, setNearbyDistrictId] = useState<string | null>(null);
  const [sim, setSim] = useState<SimSettings>(DEFAULT_SIM);

  // Keep <html data-theme> in sync.
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

  const recommendation = useMemo(
    () => recommendPlan(district, safeFarm, { climate, priorities, currentPlan: traditionalPlan }),
    [district, safeFarm, climate, priorities, traditionalPlan]
  );
  const override = planOverrides[district.id];
  const recommendedPlan = isPlan(override) ? override : recommendation.plan;
  const isCustomPlan = isPlan(override) && override.join() !== recommendation.plan.join();
  const chosenStrategy = recommendation.strategies.find(s => s.plan.join() === recommendedPlan.join()) ?? null;

  const tradMetrics = useMemo(() => calculatePlanMetrics(traditionalPlan, district, safeFarm), [traditionalPlan, district, safeFarm]);
  const recMetrics = useMemo(() => calculatePlanMetrics(recommendedPlan, district, safeFarm), [recommendedPlan, district, safeFarm]);
  const simTradMetrics = useMemo(() => calculatePlanMetrics(traditionalPlan, district, safeFarm, sim), [traditionalPlan, district, safeFarm, sim]);
  const simRecMetrics = useMemo(() => calculatePlanMetrics(recommendedPlan, district, safeFarm, sim), [recommendedPlan, district, safeFarm, sim]);


  // ---------- Location ----------

  const locate = (apply: boolean) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator) || !window.isSecureContext) {
      setLocationStatus('unsupported');
      return;
    }
    setLocationStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = nearestDistrict(pos.coords.latitude, pos.coords.longitude);
        setNearbyDistrictId(nearest.id);
        if (apply) setDistrictId(nearest.id);
        setLocationStatus('found');
      },
      () => setLocationStatus('denied'),
      { timeout: 15000, maximumAge: 600000 }
    );
  };

  // Ask for the location as soon as the site opens. New visitors get their district
  // picked for them; returning ones keep their choice and are offered the nearby one.
  const askedLocation = useRef(false);
  useEffect(() => {
    if (!ready || askedLocation.current) return;
    askedLocation.current = true;
    locate(!onboarded);
    // Runs once, after saved settings have loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // ---------- Local profile ----------

  const makeUser = (name: string, phone: string): User => {
    const clean = name.trim() || tr(lang, 'Farmer', 'কৃষক');
    return { id: LOCAL_USER_ID, name: clean, email: '', phone: phone.trim() || '—', initials: initialsOf(clean), role: 'farmer' };
  };

  const getStarted = (name: string) => {
    const clean = name.trim();
    if (!user) setUser(makeUser(clean, '—'));
    else if (clean && clean !== user.name) setUser(makeUser(clean, user.phone));
    setEntered(true);
    setMenuOpen(false);
    setActiveTab('rotation');
  };

  const updateUser = async (patch: { name?: string; phone?: string }) => {
    if (!user) return false;
    setUser(makeUser(patch.name ?? user.name, patch.phone ?? user.phone));
    return true;
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
    entered,
    getStarted,
    locationStatus,
    nearbyDistrictId,
    locate,
    updateUser,

    onboarded,
    finishOnboarding: () => { setOnboarded(true); setActiveTab('rotation'); },

    activeTab,
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

    sim, setSim,

    recommendation,
    priorities,
    togglePriority: (p) => setPriorities(prev => (prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])),
    chosenStrategy,
    applyStrategy: (plan) => setPlanOverrides(prev => ({ ...prev, [district.id]: plan })),
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

  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
