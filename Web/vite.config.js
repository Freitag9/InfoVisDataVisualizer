import { defineConfig } from 'vite';

// On GitHub Pages the site is served from /InfoVisDataVisualizer/.
// Locally (dev) we keep the root base so http://localhost:5173/ works.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/InfoVisDataVisualizer/' : '/',
  server: {
    // https: true, // Only enable for WebXR testing on real devices (requires mkcert)
    host: true,
    allowedHosts: ['declared-plated-deflate.ngrok-free.dev', '.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app'],
  },
  optimizeDeps: {
    include: ['@babylonjs/core', '@babylonjs/gui', 'papaparse'],
  },
  build: {
    target: 'esnext',
  },
}));
