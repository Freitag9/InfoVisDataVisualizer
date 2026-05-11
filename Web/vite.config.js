import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    https: true, // WebXR requires HTTPS
    host: true,
  },
  optimizeDeps: {
    include: ['@babylonjs/core', '@babylonjs/gui', 'papaparse'],
  },
  build: {
    target: 'esnext',
  },
});
