/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Map base colors to CSS variables for dynamic theming
        white: 'rgb(var(--color-white) / <alpha-value>)',
        gray: {
          100: 'rgb(var(--color-gray-100) / <alpha-value>)',
          200: 'rgb(var(--color-gray-200) / <alpha-value>)',
          300: 'rgb(var(--color-gray-300) / <alpha-value>)',
          400: 'rgb(var(--color-gray-400) / <alpha-value>)',
          500: 'rgb(var(--color-gray-500) / <alpha-value>)',
          600: 'rgb(var(--color-gray-600) / <alpha-value>)',
          700: 'rgb(var(--color-gray-700) / <alpha-value>)',
          800: 'rgb(var(--color-gray-800) / <alpha-value>)',
          900: 'rgb(var(--color-gray-900) / <alpha-value>)',
        },
        
        // Primary — deep teal-cyan medical palette
        primary: {
          50:  '#edfffe', 100: '#c0fffd', 200: '#81fefb',
          300: '#3af8f5', 400: '#0ce5e5', 500: '#00c4c9',
          600: '#009da6', 700: '#007d86', 800: '#06636c',
          900: '#0a525a', 950: '#003139',
        },
        // Accent — vibrant violet-indigo
        accent: {
          50:  '#f3f1ff', 100: '#ebe5ff', 200: '#d9ceff',
          300: '#bea6ff', 400: '#9f6eff', 500: '#8338ec',
          600: '#7417e4', 700: '#6310c7', 800: '#520ea3',
          900: '#450f85', 950: '#290560',
        },
        // Surface colors for glassmorphism
        surface: {
          dark:    'rgb(var(--surface-dark) / <alpha-value>)',
          card:    'rgb(var(--surface-card) / <alpha-value>)',
          hover:   'rgb(var(--surface-hover) / <alpha-value>)',
          border:  'rgb(var(--surface-border) / <alpha-value>)',
          light:   'rgb(var(--surface-light) / <alpha-value>)',
        },
        // Semantic colors
        success: { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a' },
        warning: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
        danger:  { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
        info:    { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, rgba(0,196,201,0.1) 0%, rgba(131,56,236,0.1) 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'glass':     '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-sm':  '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-lg':  '0 16px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
        'glow':      '0 0 20px rgba(0,196,201,0.3)',
        'glow-accent': '0 0 20px rgba(131,56,236,0.3)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      // Note: Kept animations simple as per user request (no complex physics/springs)
      animation: {
        'fade-in':       'fadeIn 0.3s ease-out',
        'pulse-glow':    'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        pulseGlow:    { '0%,100%': { boxShadow: '0 0 20px rgba(0,196,201,0.2)' }, '50%': { boxShadow: '0 0 40px rgba(0,196,201,0.4)' } },
      },
    },
  },
  plugins: [],
};
