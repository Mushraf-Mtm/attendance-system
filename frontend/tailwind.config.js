/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Admin dark theme palette
        admin: {
          bg:       '#0E1320',
          surface:  '#161D2E',
          elevated: '#1C2540',
          accent:   '#3B82F6',
          accent2:  '#60A5FA',
          text:     '#FFFFFF',
          secondary:'#CBD5E1',
          muted:    '#94A3B8',
        },
        // Employee light theme palette
        emp: {
          bg:       '#F8FAFC',
          card:     '#FFFFFF',
          elevated: '#F1F5F9',
          accent:   '#2563EB',
          accent2:  '#3B82F6',
          text:     '#0F172A',
          secondary:'#475569',
          border:   '#E2E8F0',
        },
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      boxShadow: {
        // Clay admin dark
        'clay-admin':       '0 4px 24px rgba(0,0,0,0.45), 0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        'clay-admin-hover': '0 8px 40px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'clay-admin-modal': '0 24px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5)',
        'glow-blue':        '0 0 20px rgba(59,130,246,0.4), 0 0 40px rgba(59,130,246,0.15)',
        'glow-blue-sm':     '0 0 12px rgba(59,130,246,0.35)',
        'glow-emerald':     '0 0 16px rgba(16,185,129,0.4)',
        // Clay employee light
        'clay':             '0 4px 20px rgba(0,0,0,0.06), 0 1px 6px rgba(0,0,0,0.04)',
        'clay-hover':       '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
        'clay-modal':       '0 20px 64px rgba(0,0,0,0.18), 0 6px 20px rgba(0,0,0,0.1)',
        'clay-lg':          '0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06)',
        // Legacy
        'card':             '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover':       '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
        'modal':            '0 20px 60px rgba(0,0,0,0.25)',
      },
      borderRadius: {
        'clay':    '16px',
        'clay-lg': '20px',
        'clay-xl': '24px',
      },
      animation: {
        'fade-in':    'fadeIn 0.15s ease-out',
        'slide-up':   'slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':   'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'float':      'float 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'skeleton':   'skeleton 1.5s ease-in-out infinite',
        'shimmer':    'shimmer 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.94) translateY(6px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(59,130,246,0.3)' },
          '50%':      { boxShadow: '0 0 24px rgba(59,130,246,0.6)' },
        },
        skeleton: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
    },
  },
  plugins: [],
}
