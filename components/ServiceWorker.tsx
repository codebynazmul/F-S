'use client';

import { useEffect } from 'react';

/** Registers public/sw.js so the app can be installed and opened offline. Production only. */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
  return null;
}
