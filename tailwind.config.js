/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark': {
          100: '#1a1a1a',
          200: '#2d2d2d',
          300: '#3a3a3a',
          400: '#404040',
        }
      },
      animation: {
        'typing': 'typing 1.4s infinite',
        'slide-in': 'slideIn 0.3s ease',
      },
      keyframes: {
        typing: {
          '0%, 60%, 100%': {
            transform: 'translateY(0)',
            opacity: '0.5'
          },
          '30%': {
            transform: 'translateY(-10px)',
            opacity: '1'
          }
        },
        slideIn: {
          'from': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      }
    },
  },
  plugins: [],
}
