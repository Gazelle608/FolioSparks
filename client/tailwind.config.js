/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F4EA',
          100: '#DAF1DE',
          200: '#8EB69B',
          300: '#6A9A7A',
          400: '#235347',
          500: '#1A4036',
          600: '#163832',
          700: '#0B2B26',
          800: '#051F20',
          900: '#021615',
        },
        accent: {
          light: '#DAF1DE',
          DEFAULT: '#8EB69B',
          dark: '#235347',
        },
        spark: {
          DEFAULT: '#FFD700',
          dark: '#F4A460',
        }
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Merriweather', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-green': 'linear-gradient(135deg, #051F20 0%, #235347 100%)',
        'gradient-light': 'linear-gradient(135deg, #DAF1DE 0%, #8EB69B 100%)',
        'spark-gradient': 'linear-gradient(135deg, #FFD700 0%, #F4A460 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'slideUp': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}