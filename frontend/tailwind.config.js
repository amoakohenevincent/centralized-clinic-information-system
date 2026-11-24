/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        medi: {
          teal: {
            50: '#effaf8',
            100: '#d5f4ee',
            200: '#adeadc',
            300: '#73dac5',
            400: '#38c1a7',
            500: '#0ea5a0',
            600: '#008b8b',
            700: '#007070',
            800: '#065757',
            900: '#0a4747',
          },
          navy: {
            800: '#0e2a47',
            900: '#0b2038',
            950: '#071628',
          },
          blue: {
            500: '#0066cc',
            600: '#0052a3',
            700: '#003d7a',
          },
        },
      },
      boxShadow: {
        card: '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
        floating: '0 20px 40px -10px rgba(14, 165, 160, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
