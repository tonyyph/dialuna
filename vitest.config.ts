import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    include: ['src/services/**/*.test.ts', 'src/utils/**/*.test.ts', 'src/theme/**/*.test.ts'],
    environment: 'node',
  },
});
