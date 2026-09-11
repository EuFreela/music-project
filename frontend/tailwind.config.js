/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode (preto puro)
        'dark-bg': '#000000',
        'dark-surface': '#111111',
        'dark-card': '#1a1a1a',
        'dark-border': '#222222',
        'dark-text': '#FFFFFF',
        'dark-text-secondary': '#A1A1AA',

        // Light mode
        'light-bg': '#FFFFFF',
        'light-surface': '#F5F5F5',
        'light-card': '#FFFFFF',
        'light-border': '#E5E5E5',
        'light-text': '#171717',
        'light-text-secondary': '#737373',

        // Acento roxo
        accent: {
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}