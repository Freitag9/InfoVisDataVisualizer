import { defineConfig } from 'vite';

export default defineConfig({
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
});
