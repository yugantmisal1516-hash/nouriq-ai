/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        warm: {
          50: '#FAF8F5',
          100: '#F4F0EA',
          200: '#EFECE6',
          300: '#E2DDD5',
          400: '#D5CEC2',
          500: '#A8A090',
          600: '#78716C',
          700: '#57534E',
          800: '#292524',
          900: '#1C1917',
          950: '#0C0A09'
        },
        sage: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        terracotta: {
          500: '#F97316',
          600: '#EA580C',
        }
      },
      boxShadow: {
        'liquid': '0 20px 40px -15px rgba(28, 25, 24, 0.05), 0 0 15px 0 rgba(255, 255, 255, 0.6) inset',
        'liquid-hover': '0 25px 50px -12px rgba(28, 25, 24, 0.08), 0 0 20px 0 rgba(255, 255, 255, 0.9) inset',
        'glass-glow': '0 10px 30px -5px rgba(16, 185, 129, 0.15)',
      }
    },
  },
  plugins: [],
}
