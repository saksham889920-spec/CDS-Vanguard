import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Changed to function format to access 'mode' and 'loadEnv'
export default defineConfig(({ mode }) => {
  // Load env variables from process.env (Vercel) or .env files (Local)
  const env = loadEnv(mode, '.', '');

  // Aggregating your specific keys from Vercel
  const keyList = [
    env.API_KEY,          // Standard key
    env.AIzaSy_Key1,      // Your specific keys from the screenshot
    env.AIzaSy_Key2,
    env.AIzaSy_Key3,
    env.AIzaSy_Key4,
    env.AIzaSy_Key5
  ].filter(k => !!k && k.trim() !== ''); // Remove undefined/empty

  const combinedApiKeys = keyList.join(',');

  return {
    plugins: [react()],
    define: {
      // Injects the combined comma-separated string into the code at build time.
      'process.env.API_KEY': JSON.stringify(combinedApiKeys),
      // Provides a fallback to prevent "process is not defined" errors in the browser.
      'process.env': {}
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});