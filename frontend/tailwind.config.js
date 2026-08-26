/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ragb: {
          green: "#10b981",
          amber: "#f59e0b",
          orange: "#f97316",
          red: "#ef4444"
        },
        navy: {
          800: "#0f172a",
          900: "#020617"
        }
      }
    },
  },
  plugins: [],
}
