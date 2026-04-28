// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react() // ✅ Sin configuración adicional de Babel
  ],
});
// Trigger restart