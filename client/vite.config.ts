// @ts-nocheck
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, path.resolve(process.cwd(), '..'), '');
  const clientEnv = loadEnv(mode, process.cwd(), '');
  const env = { ...rootEnv, ...clientEnv };
  return {
  plugins: [react(), nodePolyfills()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@store': path.resolve(__dirname, './src/store'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Workstream 1: Updated proxy target to match DFX local replica port
      '/api': {
        target: 'http://127.0.0.1:4943', 
        changeOrigin: true,
      },
    },
  },
  define: {
    // ICP / Auth env vars (Workstream 2)
    'process.env.DFX_NETWORK': JSON.stringify(env.DFX_NETWORK),
    'process.env.MEDVAULT_BACKEND_CANISTER_ID': JSON.stringify(env.CANISTER_ID_MEDVAULT_BACKEND || env.MEDVAULT_BACKEND_CANISTER_ID),
    'process.env.INTERNET_IDENTITY_CANISTER_ID': JSON.stringify(env.CANISTER_ID_INTERNET_IDENTITY || env.INTERNET_IDENTITY_CANISTER_ID),
    // Pinata / IPFS env vars (Workstream 2 → 4)
    'process.env.VITE_PINATA_JWT': JSON.stringify(env.VITE_PINATA_JWT),
    'process.env.VITE_PINATA_GATEWAY': JSON.stringify(env.VITE_PINATA_GATEWAY),
    'global': 'globalThis',
    'process.version': JSON.stringify('v18.0.0'),
  },
  };
});
