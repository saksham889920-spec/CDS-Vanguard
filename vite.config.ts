
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Inject process.env for compatibility with the Gemini SDK guidelines
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env': {}
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
});
