import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import compression from 'vite-plugin-compression';

const repositoryName = 'banestesApply';

export default defineConfig({
  base: `/${repositoryName}/`,
  plugins: [
    react(),
    tailwindcss(),
    compression(),
    compression({ algorithm: 'gzip' }),
  ],
  build: {
    target: 'es2015',
  },
});
