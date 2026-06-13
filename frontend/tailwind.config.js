/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: 'var(--color-bg)',
        darkSurface: 'var(--color-surface)',
        darkBorder: 'var(--color-border)',
        glassBg: 'var(--color-glass-bg)',
        glassBorder: 'var(--color-glass-border)',
        brandBlue: '#3b82f6',
        brandPurple: '#8b5cf6',
        brandAccent: '#10b981',
        gray: {
          50: 'var(--color-gray-50)',
          100: 'var(--color-gray-100)',
          200: 'var(--color-gray-100)',
          300: 'var(--color-gray-300)',
          400: 'var(--color-gray-400)',
          500: 'var(--color-gray-500)',
          600: 'var(--color-gray-600)',
          700: 'var(--color-gray-700)',
          800: 'var(--color-gray-800)',
          900: 'var(--color-gray-900)'
        }
      },
      animation: {
        'avatar-talk': 'talk 0.35s infinite alternate ease-in-out',
        'avatar-blink': 'blink 4s infinite ease-in-out',
        'avatar-bounce': 'bounceSlow 3s infinite ease-in-out',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'glow': 'glowPulse 2s infinite ease-in-out'
      },
      keyframes: {
        talk: {
          '0%': { transform: 'scaleY(0.3)' },
          '100%': { transform: 'scaleY(1.2)' }
        },
        blink: {
          '0%, 90%, 100%': { transform: 'scaleY(1)' },
          '95%': { transform: 'scaleY(0.1)' }
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)' }
        }
      }
    },
  },
  plugins: [],
}
