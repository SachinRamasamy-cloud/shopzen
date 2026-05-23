/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        bg:      '#f5f4f0',
        surface: '#ffffff',
        border:  '#d9d6cf',
        muted:   '#a09c96',
        ink:     '#1a1917',
        subtle:  '#6b6762',
        tag:     '#f0ede8',
      },
    },
  },
  plugins: [],
};
