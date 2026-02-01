import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'retro-bg': '#f0f0f0',
        'retro-border': '#000000',
        'retro-shadow': '#000000',
        'retro-yellow': '#FFD60A',
        'retro-purple': '#C4A1FF',
        'retro-orange': '#FF9F1C',
        'retro-green': '#4ADE80',
      },
      boxShadow: {
        retro: '4px 4px 0px 0px #000000',
        'retro-hover': '2px 2px 0px 0px #000000',
      },
      fontFamily: {
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
