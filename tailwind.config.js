/** @type {import('tailwindcss').Config} */
module.exports = {
  // `dark:` classes follow the app's own day/night switch, not the OS setting.
  darkMode: ['selector', '[data-theme="night"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Accent scale. The class name stays "sky" so existing markup keeps working,
        // but the values come from CSS variables in globals.css: deep teal in the
        // app, and the original sky blue inside the admin panel (.fs-classic).
        sky: Object.fromEntries(
          [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(k => [k, `rgb(var(--sky-${k}) / <alpha-value>)`])
        ),
        // NIGHT theme — deep dark gray
        graphite: {
          50:  "#F1F5F9",
          100: "#E2E8F0",
          200: "#CBD5E1",
          300: "#94A3B8",
          400: "#64748B",
          500: "#475569",
          600: "#334155",
          700: "#1F2937",
          800: "#111827",
          900: "#0B0F14",
          950: "#06080B",
        },
        // NASA brand accents (kept for accents only)
        nasa: {
          blue:  "#0B3D91",
          red:   "#FC3D21",
          accent:"#0EA5E9",
        },
      },
      fontFamily: {
        // Inter for Latin text; Noto Sans Bengali fills in every Bangla character.
        // --font-ui is set in globals.css (Instrument Sans; Inter inside the admin panel).
        sans: ['var(--font-ui)', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco',
               'Consolas', 'monospace'],
      },
      fontSize: {
        // Smallest text in the app is 13px so it stays readable on phones outdoors.
        xs: ['0.8125rem', { lineHeight: '1.25rem' }],
      },
      minHeight: {
        tap: '44px',
      },
      minWidth: {
        tap: '44px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glass':       '0 8px 32px rgba(14, 165, 233, 0.18)',
        'glass-dark':  '0 8px 32px rgba(0, 0, 0, 0.55)',
        'fab':         '0 12px 28px rgba(14, 165, 233, 0.30)',
      },
      keyframes: {
        'popup': {
          '0%':   { transform: 'scale(0.92) translateY(6px)', opacity: '0' },
          '60%':  { transform: 'scale(1.03) translateY(-2px)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'popup': 'popup 480ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
