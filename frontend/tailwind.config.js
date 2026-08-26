/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        command: {
          bg: "#07131F",
          card: "#0D1E30",
          cardHover: "#11263C",
          surface: "#0B1A2A",
          border: "#16324A",
          borderLight: "#1E4260",
        },
        cyan: {
          DEFAULT: "#00E5FF",
          light: "#E0F7FA",
          dark: "#00B4D8",
          glow: "rgba(0, 229, 255, 0.2)",
        },
        gold: {
          DEFAULT: "#F59E0B",
          light: "#FDE68A",
          dark: "#D97706",
          glow: "rgba(245, 158, 11, 0.2)",
        },
        risk: {
          critical: "#EF4444",
          criticalBg: "rgba(239, 68, 68, 0.15)",
          criticalBorder: "rgba(239, 68, 68, 0.4)",
          high: "#F97316",
          highBg: "rgba(249, 115, 22, 0.15)",
          highBorder: "rgba(249, 115, 22, 0.4)",
          moderate: "#EAB308",
          moderateBg: "rgba(234, 179, 8, 0.15)",
          moderateBorder: "rgba(234, 179, 8, 0.4)",
          low: "#10B981",
          lowBg: "rgba(16, 185, 129, 0.15)",
          lowBorder: "rgba(16, 185, 129, 0.4)",
          stable: "#14B8A6",
          stableBg: "rgba(20, 184, 166, 0.15)",
          stableBorder: "rgba(20, 184, 166, 0.4)",
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        'command-card': '0 4px 20px rgba(0, 0, 0, 0.35)',
        'cyan-glow': '0 0 15px rgba(0, 229, 255, 0.25)',
        'gold-glow': '0 0 15px rgba(245, 158, 11, 0.25)',
        'red-glow': '0 0 15px rgba(239, 68, 68, 0.3)',
      },
    },
  },
  plugins: [],
}
