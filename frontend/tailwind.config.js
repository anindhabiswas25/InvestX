/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark background layers
        dark: {
          950: '#05070D',
          900: '#0B0F1A',
          800: '#111827',
          700: '#1A2235',
          600: '#1E2A45',
        },
        // Primary neon gradient stops
        primary: {
          50:  '#f5f0ff',
          100: '#ede0ff',
          200: '#d4b3ff',
          300: '#b580ff',
          400: '#9b54ff',
          500: '#7C4DFF',
          600: '#6b3de8',
          700: '#5a2dd1',
          800: '#4921b8',
          900: '#3b189e',
        },
        // Cyan accent
        cyan: {
          400: '#22d3ee',
          500: '#00C6FF',
          600: '#00b4e6',
        },
        // Neon teal accent
        teal: {
          400: '#00F5D4',
          500: '#00dcbf',
          600: '#00c4aa',
        },
        // Legacy alias (keeps old code working)
        accent: {
          50:  '#f0fffe',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#00F5D4',
          500: '#00dcbf',
          600: '#00c4aa',
          700: '#0d9488',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient':   'linear-gradient(135deg, #0B0F1A 0%, #111827 50%, #0B0F1A 100%)',
        'neon-gradient':   'linear-gradient(135deg, #7C4DFF 0%, #00C6FF 100%)',
        'glass':           'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
      },
      boxShadow: {
        'neon':        '0 0 20px rgba(124,77,255,0.4), 0 0 40px rgba(124,77,255,0.1)',
        'neon-cyan':   '0 0 20px rgba(0,198,255,0.4), 0 0 40px rgba(0,198,255,0.1)',
        'neon-teal':   '0 0 20px rgba(0,245,212,0.4)',
        'glass':       '0 8px 32px rgba(0,0,0,0.4)',
        'card':        '0 4px 24px rgba(0,0,0,0.3)',
        'card-hover':  '0 8px 40px rgba(124,77,255,0.25)',
        'glow-sm':     '0 0 8px rgba(124,77,255,0.5)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'float':     'float 6s ease-in-out infinite',
        'pulse-glow':'pulse-glow 2s ease-in-out infinite',
        'fade-up':   'fade-up 0.6s ease-out',
        'slide-in':  'slide-in 0.5s ease-out',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124,77,255,0.4)' },
          '50%':       { boxShadow: '0 0 40px rgba(124,77,255,0.8)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};
