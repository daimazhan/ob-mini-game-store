import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 设置后端接口代理配置
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:2026',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '/api'),
      },
    },
  },
})
