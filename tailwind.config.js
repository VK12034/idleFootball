/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '420px',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'ui-monospace', 'monospace'],
        term: ['VT323', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Outlines and shadows stay dark so the chunky pixel edges read.
        ink: '#160e46',
        // Panel faces and wells — saturated indigo, not grey.
        deep: '#221a75',
        night: '#4f46e5',
        dusk: '#6b62ff',
        turf: '#4fd167',
        turfdark: '#35ac4c',
        chalk: '#fffdf2',
        amber: '#ffd23f',
        flame: '#ff5a5f',
        sky: '#45d9ff',
        lime: '#a3f542',
        grape: '#c56bff',
      },
      keyframes: {
        shake: {
          '0%,100%': { transform: 'translate(0,0)' },
          '20%': { transform: 'translate(-3px,2px)' },
          '40%': { transform: 'translate(3px,-2px)' },
          '60%': { transform: 'translate(-2px,-2px)' },
          '80%': { transform: 'translate(2px,2px)' },
        },
        bump: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '35%': { transform: 'translateY(-5px) scale(1.04)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        popIn: {
          '0%': { transform: 'translateY(5px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        burst: {
          '0%': { transform: 'scale(0.4) rotate(-8deg)', opacity: '0' },
          '18%': { transform: 'scale(1.25) rotate(4deg)', opacity: '1' },
          '32%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
          '82%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1.15)', opacity: '0' },
        },
        blink: {
          '0%,49%': { opacity: '1' },
          '50%,100%': { opacity: '0.25' },
        },
        bob: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        stripe: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '32px 0' },
        },
      },
      animation: {
        shake: 'shake 320ms steps(2,end) 2',
        bump: 'bump 320ms ease-out',
        popIn: 'popIn 120ms steps(3,end)',
        burst: 'burst 1100ms steps(8,end) forwards',
        blink: 'blink 900ms steps(1,end) infinite',
        bob: 'bob 1.4s steps(2,end) infinite',
        stripe: 'stripe 600ms linear infinite',
      },
    },
  },
  plugins: [],
};
