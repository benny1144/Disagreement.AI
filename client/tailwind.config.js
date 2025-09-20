/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#5D5FEF',      
        'background-gray': '#F5F7FA', 
        'accent-green': '#28A745',     
        'text-gentle': '#333333',      
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'], 
      },
    },
  },
  plugins: [],
}