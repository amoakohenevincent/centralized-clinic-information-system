/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        clinic: {
          50: "#effaf8",
          100: "#d8f2ed",
          500: "#168b78",
          600: "#117364",
          700: "#105d53",
          900: "#123d39"
        }
      },
      boxShadow: {
        soft: "0 16px 50px rgba(20, 66, 60, .08)"
      }
    }
  },
  plugins: []
};
