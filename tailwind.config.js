/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          background: '#FFFFFF',
          text: '#000000',
          border: '#E5E7EB',
          accent: '#F3F4F6',
        },
        dark: {
          background: '#000000',
          text: '#FFFFFF',
          border: '#374151',
          accent: '#111827',
        },
      },
      fontFamily: {
        safiro: ['Safiro', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      maxWidth: {
        layout: '1000px',
      },
    },
  },
  plugins: [],
};