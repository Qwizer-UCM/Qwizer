import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import manifest from './public/manifest.json'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      sourcemap: false
    },
    server: {
      host: env.REACT_HOST,
      port: env.REACT_PORT,
    },
    envPrefix: 'REACT_',
    plugins: [
      react(),
      VitePWA({
        manifest,
        registerType: 'autoUpdate',
        strategies: 'injectManifest',
        filename: 'sw.js',
      }),
    ],
  };
});
