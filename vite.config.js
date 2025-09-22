import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:8080',
         changeOrigin: true,
         secure: false,
         configure: (proxy, _options) => {
           proxy.on('error', (err, _req, _res) => {
             console.log('🔴 Proxy error:', err);
           });
           proxy.on('proxyReq', (proxyReq, req, _res) => {
             console.log('🟡 Sending Request to Target:', req.method, req.url, '→', proxyReq.getHeader('host'));
           });
           proxy.on('proxyRes', (proxyRes, req, _res) => {
             console.log('🟢 Received Response from Target:', proxyRes.statusCode, req.url);
           });
         },
       },
     },
   },
})
