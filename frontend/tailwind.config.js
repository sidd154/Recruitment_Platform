/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          base: '#0F1117',
          surface: '#1A1D27',
          border: 'rgba(255,255,255,0.07)',
          amber: '#E8A830',
          amberHover: '#FBE09B',
          cream: '#F5F0E8',
          sage: '#6A8F78',
          ash: '#414659'
        }
      },
      fontFamily: {
        editorial: ['"Playfair Display"', 'serif'],
        terminal: ['"DM Mono"', 'monospace'],
        body: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
