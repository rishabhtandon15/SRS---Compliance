/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        compliant: '#22c55e',
        conditional: '#f59e0b',
        noncompliant: '#ef4444',
        missing: '#64748b',
        omission: '#f97316',
      }
    },
  },
  plugins: [],
}
