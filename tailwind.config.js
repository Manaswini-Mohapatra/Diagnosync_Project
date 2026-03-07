/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066FF',
        secondary: '#00D4FF',
        success: '#00B341',
        warning: '#FFB700',
        danger: '#FF3333',
        'dark-gray': '#333333',
        'light-gray': '#F5F5F5',
        'border-gray': '#EEEEEE'
      }
    }
  },
  plugins: []
}
