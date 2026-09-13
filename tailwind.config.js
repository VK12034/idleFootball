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
        // Outlines. Every panel edge in the game is one of these two.
        ink: '#1b2a6b',
        night: '#0e1440',
        // The phone shell and helmet shells.
        shell: '#12184a',
        // Paper faces.
        chalk: '#fffdf2',
        paper: '#e7ebf8',
        lock: '#dfe4f5',
        // Muted body copy on paper.
        mute: '#5566a8',
        mutedeep: '#41508c',
        // Chrome.
        steel: '#3a4fa8',
        // Accents.
        amber: '#ffe452',
        gold: '#ffd23f',
        lime: '#8cf25b',
        sky: '#3fd8ff',
        flame: '#ff7a3d',
        grape: '#a24cf0',
        pink: '#ff5fa8',
        // Turf.
        turf: '#6adf62',
        turfdark: '#3fae4b',
        grass: '#2e7d3a',
      },
      keyframes: {
        drift: {
          from: { transform: 'translateX(-140px)' },
          to: { transform: 'translateX(430px)' },
        },
        bob: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        pop: {
          '0%': { transform: 'scale(.7)', opacity: '0' },
          '25%': { transform: 'scale(1.05)', opacity: '1' },
          '80%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        bump: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '35%': { transform: 'translateY(-5px) scale(1.02)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        blink: {
          '0%,49%': { opacity: '1' },
          '50%,100%': { opacity: '0.25' },
        },
      },
      animation: {
        bob: 'bob 3.2s steps(4,end) infinite',
        bobslow: 'bob 2.4s steps(3,end) infinite',
        pop: 'pop .9s steps(6,end)',
        bump: 'bump 320ms ease-out',
        blink: 'blink 900ms steps(1,end) infinite',
      },
    },
  },
  plugins: [],
};
