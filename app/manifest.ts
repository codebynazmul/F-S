import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Field Shift — Climate-Smart Crop Planner',
    short_name: 'Field Shift',
    description: 'Climate-adaptive crop rotation and soil health planning for Bangladesh.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF6EA',
    theme_color: '#2A7121',
    lang: 'bn',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
