/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',
        secondary: '#111827',
        accent: '#34d399',
        'bg-dark': '#0a0a0b',
        'bg-surface': '#161b22',
        'text-main': '#f9fafb',
        'text-muted': '#9ca3af',
      }
    },
  },
  plugins: [],
}
