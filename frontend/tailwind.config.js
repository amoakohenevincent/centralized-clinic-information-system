/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px',
      },
      colors: {
        notion: {
          bg: '#fbfbfa',
          sidebar: '#f7f6f3',
          card: '#ffffff',
          text: '#191919',
          muted: '#787774',
          subtle: '#9b9a97',
          border: '#e9e9e7',
          borderHover: '#d0d0ce',
          hover: '#f1f1ef',
          active: '#e5e5e3',
          tag: {
            gray: { bg: '#ebebeb', text: '#5a5a5a' },
            brown: { bg: '#f4eeee', text: '#976d57' },
            orange: { bg: '#faebd3', text: '#c76a15' },
            yellow: { bg: '#fdecc8', text: '#d9730d' },
            green: { bg: '#dbeddb', text: '#2b784c' },
            blue: { bg: '#d3e5ef', text: '#24638a' },
            purple: { bg: '#e8deee', text: '#6940a5' },
            pink: { bg: '#f5e0e9', text: '#ad1a72' },
            red: { bg: '#ffe2dd', text: '#c3453a' },
          },
        },
      },
      boxShadow: {
        'notion-card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'notion-popover': '0 4px 14px rgba(15, 15, 15, 0.06), 0 0 0 1px rgba(15, 15, 15, 0.04)',
        'notion-button': '0 1px 2px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
