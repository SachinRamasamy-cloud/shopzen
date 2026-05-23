/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        bg:      '#030014', // Deep space background
        surface: '#09071c', // Card / navbar background
        border:  '#1b163d', // Futuristic indigo border
        muted:   '#7c74b3', // Soft lavender for metadata / labels
        ink:     '#f5f4ff', // Crisp ice-white for primary text
        subtle:  '#b5b0d8', // Light lavender-gray for body copy
        tag:     '#161233', // Subtle highlight background
        primary: {
          DEFAULT: '#6366f1',
          glow: 'rgba(99, 102, 241, 0.15)',
        },
        accent: {
          DEFAULT: '#d946ef',
          cyan: '#06b6d4',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(99, 102, 241, 0.25)',
        'glow-accent': '0 0 20px rgba(217, 70, 239, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
};
