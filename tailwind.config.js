/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#F5F7ED',
          100: '#E7ECD3',
          500: '#606C38',
          600: '#4F5A2E',
          700: '#3E4624',
          DEFAULT: '#606C38',
        },
        forest: {
          50: '#F2F5EE',
          100: '#E1E9D7',
          500: '#283618',
          600: '#1F2B13',
          700: '#17200E',
          DEFAULT: '#283618',
        },
        cream: {
          50: '#FFFEF7',
          100: '#FEFAE0',
          200: '#FAF4C8',
          300: '#F5EDB0',
          DEFAULT: '#FEFAE0',
        },
        sand: {
          50: '#FDF8F0',
          100: '#F9EADA',
          200: '#F3D4B4',
          500: '#DDA15E',
          600: '#C78943',
          700: '#B07432',
          DEFAULT: '#DDA15E',
        },
        rust: {
          50: '#FCF3EA',
          100: '#F6DFCB',
          200: '#EDB997',
          500: '#BC6C25',
          600: '#A1581B',
          700: '#864612',
          DEFAULT: '#BC6C25',
        },
        brand: {
          50:  '#FEFAE0',
          100: '#F5EDB0',
          200: '#DDA15E',
          300: '#C78943',
          400: '#BC6C25',
          500: '#606C38',
          600: '#4F5A2E',
          700: '#3E4624',
          800: '#283618',
          900: '#17200E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}
