import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['soundfont-player', 'soundfont2']
  },
  server: {
    host: true, // Escuta em 0.0.0.0
    port: 3000,
    open: false,
    cors: true,
    allowedHosts: true // Permite qualquer host do GitHub Codespaces (*.app.github.dev)
  }
});
