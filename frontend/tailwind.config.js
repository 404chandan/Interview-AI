/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#090d16',
        darkSurface: '#121826',
        darkBorder: '#1f293d',
        glassBg: 'rgba(18, 24, 38, 0.7)',
        glassBorder: 'rgba(255, 255, 255, 0.08)',
        brandBlue: '#3b82f6',
        brandPurple: '#8b5cf6',
        brandAccent: '#10b981'
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
