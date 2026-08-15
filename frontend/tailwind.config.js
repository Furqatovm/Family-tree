/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgCanvas: '#FAFAF9',
        cardBg: '#FFFFFF',
        primary: {
          DEFAULT: '#3F6B4F',
          hover: '#345A42',
          light: '#EAF2EC',
        },
        secondary: {
          DEFAULT: '#A67C52',
          hover: '#8C653E',
          light: '#F7F3EE',
        },
        accent: {
          DEFAULT: '#D6A756',
          hover: '#C29443',
          light: '#FAF5EA',
        },
        textDark: '#1C1917',
        textMuted: '#78716C',
        borderColor: '#E7E5E4',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 4px 20px -2px rgba(63, 107, 79, 0.08)',
        floating: '0 12px 32px -4px rgba(28, 25, 23, 0.12)',
      }
    },
  },
  plugins: [],
}
