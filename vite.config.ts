// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import compression from 'vite-plugin-compression';

const repositoryName = 'banestesApply'; // Substitua pelo nome do seu repositório

export default defineConfig({
  base: `/${repositoryName}/`, // Adicione esta linha
  plugins: [
    react(),
    tailwindcss(),
    compression(),
    compression({ algorithm: 'gzip' }),
  ],
  build: {
    target: 'es2015', // Ou outra versão mais antiga, se necessário
  },
});