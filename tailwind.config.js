/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#e8eef7',
          100: '#c5d3eb',
          200: '#9fb6dd',
          300: '#7899cf',
          400: '#5782c5',
          500: '#366bba',
          600: '#2e5da3',
          700: '#244d8a',
          800: '#1b3d71',
          900: '#0f2547',
          950: '#081630',
        },
        blue: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
        }
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #081630 0%, #0f2547 40%, #1b3d71 100%)',
        'card-gradient': 'linear-gradient(135deg, #1b3d71 0%, #244d8a 100%)',
      }
    },
  },
  plugins: [],
}
