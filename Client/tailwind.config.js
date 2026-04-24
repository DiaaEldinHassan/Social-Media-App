/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'purple': {
          600: '#7c3aed',
          700: '#6d28d9',
        },
        'gray': {
          400: '#9ca3af',
          600: '#4b5563',
        },
        'red': {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        'green': {
          400: '#4ade80',
          500: '#22c55e',
        }
      }
    },
  },
  plugins: [],
}
