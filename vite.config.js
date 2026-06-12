import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Car-words/' : '/',
  server: {
    port: 8080,
  },
  build: {
    outDir: 'dist',
  },
});
