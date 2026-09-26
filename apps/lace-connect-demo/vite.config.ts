import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      '@kshot/lace-midnight-kit': path.resolve(
        __dirname,
        '../../packages/lace-midnight-kit/src/index.ts',
      ),
    },
  },
  server: {
    port: 5174,
    open: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
