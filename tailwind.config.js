/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sncf: {
          navy: '#0f172a',
          dark: '#0a0f1d',
          header: '#111b2b',
          teal: '#00a3a6',
          tealHover: '#008b8e',
          cyan: '#06b6d4',
          accent: '#00989c',
          inoui: '#720046',
          ouigo: '#00b4d8',
          eurostar: '#003366',
          ter: '#107c41',
          prems: '#e60050',
          bg: '#f8fafc',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

