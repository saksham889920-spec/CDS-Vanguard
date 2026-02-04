
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Injects the API_KEY from Vercel's environment into the code at build time.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    // Provides a fallback to prevent "process is not defined" errors in the browser.
    'process.env': {}
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
