/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F4C75',
        'primary-light': '#3282B8',
        'primary-dark': '#0d4264',
        secondary: '#2DD4BF',
        success: '#2DD4BF',
        accent: '#FB923C',
        warning: '#FCD34D',
        danger: '#F87171',
        'dark-gray': '#111827',
        'light-gray': '#F9FAFB',
        'border-gray': '#E5E7EB',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    }
  },
  plugins: []
}
