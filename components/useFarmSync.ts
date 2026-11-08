'use client';

import { useEffect, useRef, useState } from 'react';
import type { DistrictClimate } from '@/lib/climate';
import type { RiskFlags } from '@/lib/recommend';
import { usePersistentState } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { FarmProfile, IrrigationType, SoilTexture } from '@/lib/types';

/*
 * Keeps the signed-in person's farm and plan in Supabase.
 *
 * - After sign-in, the farm saved on the account is loaded (so it follows them to a
 *   new device). Unsent edits made on this device win over the saved copy.
 * - Changes upload shortly after they are made. Without internet they wait, and
 *   upload when the connection comes back.
 * - Plans are kept as history: a new row only when the plan actually changes.
 * - Someone signing in for the first time on a device that another person used gets
 *   the setup screen, not the other person's farm.
 */

export type FarmSyncStatus = 'idle' | 'syncing' | 'pending' | 'synced' | 'offline' | 'error';

interface SyncState {
  userId: string;
  farmId: string | null;
  /** The farm as last saved to (or loaded from) the server. */
  farmKey: string | null;
  /** The plan as last saved to (or loaded from) the server. */
  planKey: string | null;
}

interface FarmRow {
  id: string;
  district_id: string;
  size_bigha: number;
  texture: SoilTexture;
  ph: number;
  organic_matter: number;
  irrigation: IrrigationType;
}

interface SavedPlan { recommended: string[]; traditional: string[]; custom: boolean }

const isSyncState = (v: unknown): v is SyncState | null =>
  v === null || (typeof v === 'object' && typeof (v as SyncState).userId === 'string');

const farmKeyOf = (districtId: string, f: FarmProfile) =>
  JSON.stringify([districtId, f.sizeBigha, f.texture, f.ph, f.organicMatter, f.irrigation]);
const planKeyOf = (p: SavedPlan) => JSON.stringify([p.recommended, p.traditional, p.custom]);

const UPLOAD_DELAY_MS = 1500;

export function useFarmSync(args: {
  userId: string | null;
  ready: boolean;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  districtId: string;
  setDistrictId: (id: string) => void;
  farm: FarmProfile;
  setFarm: (f: FarmProfile) => void;
  recommendedPlan: string[];
  traditionalPlan: string[];
  isCustomPlan: boolean;
  setTraditionalPlan: (p: string[]) => void;
  setPlanOverride: (districtId: string, plan: string[]) => void;
  isPlan: (v: unknown) => v is string[];
  risks: RiskFlags;
  climate: DistrictClimate | null;
}): FarmSyncStatus {
  const { userId, ready, onboarded, districtId, farm } = args;
  const [sync, setSync, syncLoaded] = usePersistentState<SyncState | null>('farm-sync', null, isSyncState);
  const [pulledFor, setPulledFor] = useState<string | null>(null);
  const [status, setStatus] = useState<FarmSyncStatus>('idle');
  const [retry, setRetry] = useState(0);

  const farmKey = farmKeyOf(districtId, farm);
  const plan: SavedPlan = { recommended: args.recommendedPlan, traditional: args.traditionalPlan, custom: args.isCustomPlan };
  const planKey = planKeyOf(plan);

  // The pull below runs once per sign-in; let it read the latest values without re-running.
  const latest = useRef({ args, sync, farmKey, planKey });
  latest.current = { args, sync, farmKey, planKey };

  const failed = () => setStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'error');

  // Try again when the connection comes back.
  useEffect(() => {
    const onOnline = () => setRetry(r => r + 1);
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  // 1. After sign-in: load the saved farm and latest plan.
  useEffect(() => {
    if (!ready || !syncLoaded || !userId || pulledFor === userId) return;
    let cancelled = false;
    setStatus('syncing');
    (async () => {
      const { args: a, sync: s, farmKey: localFarm, planKey: localPlan } = latest.current;
      const { data: row, error } = await supabase.from('farms')
        .select('id, district_id, size_bigha, texture, ph, organic_matter, irrigation')
        .eq('user_id', userId).maybeSingle<FarmRow>();
      if (cancelled) return;
      if (error) { failed(); return; }

      // No sync record but setup was finished: farm data from before syncing existed on
      // this device. Keep it and upload it. (After "clear saved data", setup isn't
      // finished, so the saved copy wins.)
      const adopt = !s && a.onboarded;
      const known = s?.userId === userId;
      const sameUser = known || adopt;
      const farmEdited = known ? s!.farmKey !== localFarm : adopt;
      const planEdited = known ? s!.planKey !== localPlan : adopt;

      if (row && !farmEdited) {
        const saved: FarmProfile = {
          sizeBigha: Number(row.size_bigha), texture: row.texture, ph: Number(row.ph),
          organicMatter: Number(row.organic_matter), irrigation: row.irrigation,
        };
        a.setDistrictId(row.district_id);
        a.setFarm(saved);
        a.setOnboarded(true);

        let savedPlanKey = known ? s!.planKey : null;
        if (!planEdited) {
          const { data: p } = await supabase.from('plans').select('plan')
            .eq('farm_id', row.id).order('created_at', { ascending: false }).limit(1)
            .maybeSingle<{ plan: SavedPlan }>();
          if (cancelled) return;
          if (p?.plan && a.isPlan(p.plan.traditional) && a.isPlan(p.plan.recommended)) {
            a.setTraditionalPlan(p.plan.traditional);
            if (p.plan.custom) a.setPlanOverride(row.district_id, p.plan.recommended);
            savedPlanKey = planKeyOf(p.plan);
          }
        }
        setSync({ userId, farmId: row.id, farmKey: farmKeyOf(row.district_id, saved), planKey: savedPlanKey });
      } else if (row) {
        // Unsent edits on this device: keep them; step 2 uploads them.
        setSync({ userId, farmId: row.id, farmKey: known ? s!.farmKey : null, planKey: known ? s!.planKey : null });
      } else {
        // Nothing saved yet. A different person on this device starts with the setup screen.
        if (!sameUser) a.setOnboarded(false);
        setSync({ userId, farmId: null, farmKey: null, planKey: null });
      }
      setPulledFor(userId);
      setStatus('synced');
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, syncLoaded, userId, pulledFor, retry]);

  // 2. Upload the farm after it changes (once setup is finished).
  useEffect(() => {
    if (!userId || pulledFor !== userId || !onboarded || sync?.userId !== userId) return;
    if (sync.farmKey === farmKey) return;
    setStatus('pending');
    // The size field can be briefly empty (0) while typing; the database rejects that.
    if (!(farm.sizeBigha > 0)) return;
    const timer = setTimeout(async () => {
      setStatus('syncing');
      const { data, error } = await supabase.from('farms').upsert({
        user_id: userId,
        district_id: districtId,
        size_bigha: farm.sizeBigha,
        texture: farm.texture,
        ph: farm.ph,
        organic_matter: farm.organicMatter,
        irrigation: farm.irrigation,
      }, { onConflict: 'user_id' }).select('id').single<{ id: string }>();
      if (error || !data) { failed(); return; }
      setSync(prev => ({ userId, farmId: data.id, farmKey, planKey: prev?.userId === userId ? prev.planKey : null }));
      setStatus('synced');
    }, UPLOAD_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, pulledFor, onboarded, farmKey, sync, retry]);

  // 3. Save the plan to history when it changes.
  useEffect(() => {
    if (!userId || pulledFor !== userId || !onboarded || sync?.userId !== userId) return;
    if (!sync.farmId || sync.farmKey !== farmKey || sync.planKey === planKey) return;
    const farmId = sync.farmId;
    const timer = setTimeout(async () => {
      const normals = args.climate?.normals;
      const { error } = await supabase.from('plans').insert({
        farm_id: farmId,
        plan,
        risks: args.risks,
        climate_snapshot: {
          source: normals ? 'nasa_power' : 'district_baseline',
          annual_rain_mm: normals?.annualRainMm ?? null,
          temp_mean: normals?.tempMean ?? null,
          rain_anomaly_pct: args.climate?.recent?.rainAnomalyPct ?? null,
          predictions: args.climate?.predictions ?? [],
        },
      });
      if (error) { failed(); return; }
      setSync(prev => (prev ? { ...prev, planKey } : prev));
    }, UPLOAD_DELAY_MS * 2);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, pulledFor, onboarded, farmKey, planKey, sync, retry]);

  return userId ? status : 'idle';
}
