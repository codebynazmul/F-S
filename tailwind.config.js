/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hunter: {
          50: "#F2F8F5",
          100: "#E1EFE8",
          200: "#C4DFD2",
          300: "#9EC8B4",
          400: "#6FA990",
          500: "#468B6E",
          600: "#326F55",
          700: "#275743",
          800: "#204636",
          900: "#1B3A2E",
          950: "#0D211A",
          deep: "#0B2519",
          primary: "#1B4332",
          accent: "#2D6A4F",
          light: "#40916C",
        },
        nasa: {
          blue: "#0B3D91",
          red: "#FC3D21",
          dark: "#000000",
          card: "#0A0A0A",
          border: "#1F1F1F",
          accent: "#10B981"
        }
      }
    },
  },
  plugins: [],
};
