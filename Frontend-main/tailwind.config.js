/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#e8472a',
        background: '#f5f3f0',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
