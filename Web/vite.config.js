import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // https: true, // Only enable for WebXR testing on real devices (requires mkcert)
    host: true,
  },
  optimizeDeps: {
    include: ['@babylonjs/core', '@babylonjs/gui', 'papaparse'],
  },
  build: {
    target: 'esnext',
  },
});
