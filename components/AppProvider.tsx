'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ALL_DISTRICTS, type DistrictData } from '@/data/districts';
import { CROP_DATABASE } from '@/data/crops';
import { usePersistentState } from '@/lib/storage';
import { calculatePlanMetrics, type PlanMetrics } from '@/lib/metrics';
import { recommendPlan, type Recommendation } from '@/lib/recommend';
import type {
  BroadcastAlert, FarmProfile, Lang, SimSettings, TabId, Theme, User,
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

interface AppState {
  ready: boolean;
  lang: Lang; setLang: (l: Lang) => void;
  t: (en: string, bn: string) => string;
  theme: Theme; setTheme: (t: Theme) => void;
  isNight: boolean;

  user: User | null;
  signIn: (u: User) => void;
  signOut: () => void;
  updateUser: (patch: Partial<User>) => void;

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

  alerts: BroadcastAlert[];
  sendAlert: (a: Omit<BroadcastAlert, 'id' | 'sentAt'>) => void;
  deleteAlert: (id: string) => void;
  dismissedAlerts: string[];
  dismissAlert: (id: string) => void;
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
  const [user, setUser, l3] = usePersistentState<User | null>('user', null);
  const [activeTab, setActiveTab, l4] = usePersistentState<TabId>('tab', 'rotation');
  const [districtId, setDistrictId, l5] = usePersistentState<string>('district', 'rajshahi', isDistrictId);
  const [farm, setFarm, l6] = usePersistentState<FarmProfile>('farm', DEFAULT_FARM);
  const [traditionalPlan, setTraditionalPlan, l7] = usePersistentState<string[]>('traditional-plan', DEFAULT_TRADITIONAL, isPlan);
  const [planOverrides, setPlanOverrides, l8] = usePersistentState<Record<string, string[]>>('plan-overrides', {});
  const [alerts, setAlerts, l9] = usePersistentState<BroadcastAlert[]>('alerts', []);
  const [dismissedAlerts, setDismissed, l10] = usePersistentState<string[]>('dismissed-alerts', []);
  const ready = l1 && l2 && l3 && l4 && l5 && l6 && l7 && l8 && l9 && l10;

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

  const value: AppState = {
    ready,
    lang, setLang,
    t: (en, bn) => (lang === 'bn' ? bn : en),
    theme, setTheme,
    isNight: theme === 'night',

    user,
    signIn: (u) => {
      setUser(u);
      setActiveTab(u.role === 'admin' ? 'admin' : 'rotation');
    },
    signOut: () => {
      setUser(null);
      setMenuOpen(false);
      setActiveTab('rotation');
    },
    updateUser: (patch) => setUser(prev => (prev ? { ...prev, ...patch } : prev)),

    activeTab: activeTab === 'admin' && user?.role !== 'admin' ? 'rotation' : activeTab,
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

    alerts,
    sendAlert: (a) =>
      setAlerts(prev => [
        { ...a, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, sentAt: Date.now() },
        ...prev,
      ].slice(0, 50)),
    deleteAlert: (id) => setAlerts(prev => prev.filter(a => a.id !== id)),
    dismissedAlerts,
    dismissAlert: (id) => setDismissed(prev => [...prev, id].slice(-100)),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
