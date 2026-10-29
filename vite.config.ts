import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Escuta em 0.0.0.0 (essencial para GitHub Codespaces e Docker)
    port: 3000,
    open: false
  }
});
