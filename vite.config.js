import { fileURLToPath, URL } from 'node:url' // Hỗ trợ chuyển đổi đường dẫn tệp và URL

import { defineConfig } from 'vite' // Hàm trợ giúp cấu hình Vite (kèm gợi ý kiểu)
import vue from '@vitejs/plugin-vue' // Bật hỗ trợ Vue SFC

// https://vite.dev/config/
export default defineConfig({ // Xuất đối tượng cấu hình Vite
  base: './', // Phục vụ tài nguyên theo đường dẫn tương đối (phù hợp khi deploy tĩnh/NGINX)
  plugins: [
    vue(), // Khai báo plugin Vue
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)) // Dùng @ làm bí danh (alias) trỏ tới thư mục /src
    },
  },
  server: { // Cấu hình server phát triển (dev)
    proxy: { // Proxy các request API khi phát triển
      '/api': { // Khớp các request bắt đầu bằng /api
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8080', // URL gốc của backend
        changeOrigin: true, // Ghi đè header Host theo target để tránh lỗi CORS
      },
    },
  },
})
