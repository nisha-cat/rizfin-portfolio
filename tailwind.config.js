export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#120102',
        wine: '#2b0005',
        burgundy: '#5a0010',
        crimson: '#870018',
        parchment: '#f5e6d3',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 70px rgba(135,0,24,.34)',
        soft: '0 24px 80px rgba(0,0,0,.32)',
      },
    },
  },
  plugins: [],
};
