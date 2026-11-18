import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0284c7",
          600: "#0369a1",
          700: "#075985",
          800: "#0c4a6e",
          900: "#082f49",
        },
        // Ledger palette — values live in globals.css so dark mode swaps them
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        line: "var(--line)",
        ink: "var(--ink)",
        body: "var(--body)",
        muted: "var(--muted)",
        brand: "var(--brand)",
        brandSoft: "var(--brand-soft)",
        budget: {
          subsidy: "var(--budget-subsidy)",
          innovation: "var(--budget-innovation)",
          dev: "var(--budget-dev)",
          other: "var(--budget-other)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
