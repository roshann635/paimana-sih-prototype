/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--brand)",
          dark: "var(--brand-dark)",
          light: "var(--brand-light)",
          amber: "#D9822B",
        },
        intel: {
          DEFAULT: "var(--intel)",
          dark: "#205E5B",
          light: "var(--intel-light)",
          border: "var(--intel-border)",
        },
        gov: {
          bg: "var(--background)",
          surface: "var(--surface)",
          secondary: "var(--surface-secondary)",
          subtle: "var(--surface-subtle)",
          border: "var(--border)",
          borderStrong: "var(--border-strong)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        risk: {
          normal: "var(--risk-normal)",
          normalBg: "var(--risk-normal-bg)",
          watch: "var(--risk-watch)",
          watchBg: "var(--risk-watch-bg)",
          review: "var(--risk-review)",
          reviewBg: "var(--risk-review-bg)",
          critical: "var(--risk-critical)",
          criticalBg: "var(--risk-critical-bg)",
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'Segoe UI', 'Roboto', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      borderRadius: {
        gov: '8px',
        'gov-sm': '6px',
        'gov-lg': '10px',
      },
      boxShadow: {
        gov: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'gov-md': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'gov-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
