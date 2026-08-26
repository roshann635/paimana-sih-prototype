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
        },
        intel: {
          DEFAULT: "var(--intel)",
          light: "var(--intel-light)",
        },
        gov: {
          bg: "var(--background)",
          surface: "var(--surface)",
          secondary: "var(--surface-secondary)",
          border: "var(--border)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        risk: {
          normal: "var(--risk-normal)",
          watch: "var(--risk-watch)",
          review: "var(--risk-review)",
          critical: "var(--risk-critical)",
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'Segoe UI', 'Roboto', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        gov: '8px',
        'gov-sm': '6px',
        'gov-lg': '10px',
      },
      boxShadow: {
        gov: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'gov-md': '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
