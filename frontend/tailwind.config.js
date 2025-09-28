/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f6ff',
          100: '#e1edff',
          200: '#c7d9ff',
          300: '#a8c7fa',
          400: '#8bb3f7',
          500: '#6b9ef4',
          600: '#4d89f1',
          700: '#2f74ee',
          800: '#1a5feb',
          900: '#0d4ae8'
        }
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px'
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        cardHover: '0 6px 18px rgba(0,0,0,0.10)'
      }
    },
  },
  plugins: [],
}

