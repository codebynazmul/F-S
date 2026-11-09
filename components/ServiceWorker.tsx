'use client';

import { useEffect } from 'react';

/**
 * Registers public/sw.js so the app can be installed and opened offline. Production only.
 * In development it removes any worker and caches left by an earlier production run on the
 * same address: dev file names carry no hash, so a leftover worker would serve stale code.
 */
export default function ServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations()
        .then(regs => Promise.all(regs.map(r => r.unregister())))
        .then(() => ('caches' in window ? caches.keys() : []))
        .then(keys => Promise.all(keys.filter(k => k.startsWith('fs-')).map(k => caches.delete(k))))
        .catch(() => {});
      return;
    }
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
  return null;
}
