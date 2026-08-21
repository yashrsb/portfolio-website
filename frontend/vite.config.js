import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/tests/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    globals: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          markdown: [
            'react-markdown',
            'remark-gfm',
            'rehype-sanitize',
            'rehype-highlight',
          ],
        },
      },
    },
  },
});
