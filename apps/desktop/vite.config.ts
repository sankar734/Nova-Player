import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@nova/shared-types': path.resolve(__dirname, '../../packages/shared-types/src'),
      '@nova/media-engine': path.resolve(__dirname, '../../media-engine/src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
  build: {
    target: 'esnext',
  },
});
