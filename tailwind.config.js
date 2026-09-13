/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        flashTd: {
          '0%': { backgroundColor: 'rgba(250, 204, 21, 0.45)' },
          '100%': { backgroundColor: 'rgba(250, 204, 21, 0)' },
        },
        flashTurnover: {
          '0%': { backgroundColor: 'rgba(239, 68, 68, 0.45)' },
          '100%': { backgroundColor: 'rgba(239, 68, 68, 0)' },
        },
        popIn: {
          '0%': { transform: 'translateY(4px) scale(0.96)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
      },
      animation: {
        flashTd: 'flashTd 900ms ease-out',
        flashTurnover: 'flashTurnover 900ms ease-out',
        popIn: 'popIn 140ms ease-out',
      },
    },
  },
  plugins: [],
};
