/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        ink: '#0D0C0A',
        paper: '#F3F1EC',
        cream: '#FAF9F5',
        surface: '#FFFFFF',
        muted: '#4D4A46',
        subtle: '#DFDBD2',
        accent: '#E54D2E',
        accentHover: '#CA3A1D',
        success: '#2E7D32',
        danger: '#D32F2F',
      },
      fontFamily: {
        head: ['Cabinet Grotesk', 'Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        brut: '4px 4px 0px 0px rgba(13,12,10,1)',
        brutLg: '8px 8px 0px 0px rgba(13,12,10,1)',
        soft: '0 4px 24px rgba(13,12,10,0.04)',
      },
      borderRadius: {
        sm: '2px',
        md: '4px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0', opacity: '0' },
          to: {
            height: 'var(--radix-accordion-content-height)',
            opacity: '1',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
            opacity: '1',
          },
          to: { height: '0', opacity: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.18s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
