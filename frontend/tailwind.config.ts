import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        amiri: ['Amiri', 'serif'],
        arabic: ['IBM Plex Sans Arabic', 'sans-serif'],
        ui: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        slate: {
          950: '#070a0f',
        }
      }
    },
  },
  plugins: [],
};

export default config;
