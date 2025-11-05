/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 🌙 enables class-based dark mode control
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'crimson': ['Crimson Text', 'serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
