import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 18px 50px rgba(15, 23, 42, 0.08)',
      },
      colors: {
        ink: '#172033',
        paper: '#f7f8f5',
        focus: '#d9480f',
        active: '#0f766e',
        backlog: '#4f46e5',
      },
    },
  },
  plugins: [],
} satisfies Config;
