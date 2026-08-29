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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/tests/**', 'src/main.jsx', 'src/generated/**'],
      thresholds: {
        branches: 40,
        functions: 50,
        lines: 50,
        statements: 50,
      },
    },
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
