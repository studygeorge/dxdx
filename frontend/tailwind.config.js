/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
        },
        emerald: {
          400: '#34d399',
        },
        cyan: {
          400: '#22d3ee',
        }
      },
      blur: {
        '3xl': '64px',
      },
    },
  },
  plugins: [],
}
