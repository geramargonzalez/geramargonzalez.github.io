import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          950: '#0f172a'
        }
      },
      boxShadow: {
        panel: '0 18px 45px rgba(15, 23, 42, 0.22)'
      }
    }
  },
  plugins: []
};

export default config;