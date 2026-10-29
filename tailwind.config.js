/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fl: {
          bg: '#121317',
          panel: '#1e2029',
          surface: '#272a36',
          border: '#363a4a',
          lcd: '#00ffcc',
          'lcd-bg': '#0a1617',
          accent: '#ff851b',
          'step-on': '#ff851b',
          'step-off-a': '#434758',
          'step-off-b': '#2a2c38',
          green: '#2ecc40',
          red: '#ff4136',
          blue: '#3b82f6',
          purple: '#a855f7'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'fl-glow': '0 0 10px rgba(255, 133, 27, 0.4)',
        'lcd-glow': '0 0 8px rgba(0, 255, 204, 0.5)',
      }
    },
  },
  plugins: [],
}
