import { ALL_DISTRICTS, type DistrictData } from '@/data/districts';

/** Distance in km between two points (haversine). */
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const r = (x: number) => (x * Math.PI) / 180;
  const dLat = r(bLat - aLat);
  const dLng = r(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(aLat)) * Math.cos(r(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** The district whose centre is closest to a point. */
export function nearestDistrict(lat: number, lng: number): DistrictData {
  return ALL_DISTRICTS.reduce((best, d) =>
    distanceKm(lat, lng, d.lat, d.lng) < distanceKm(lat, lng, best.lat, best.lng) ? d : best
  );
}

/**
 * Where the person's location lookup stands.
 * - unsupported: the browser has no location (or the page is not on https)
 * - denied: the person said no, or it timed out
 */
export type LocationStatus = 'idle' | 'locating' | 'found' | 'denied' | 'unsupported';
