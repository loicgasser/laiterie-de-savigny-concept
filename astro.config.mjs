import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://loicgasser.github.io',
  base: '/laiterie-de-savigny-concept',
  output: 'static',
  build: {
    format: 'file',
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
    },
  },
});
