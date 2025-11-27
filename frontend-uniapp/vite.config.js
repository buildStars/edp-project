import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  base: '/h5/',
  plugins: [
    uni()
  ],
  build: {
    // 静态资源基础路径
    assetsDir: 'assets',
    // 输出目录
    outDir: 'unpackage/dist/build/web',
    // 资源内联阈值
    assetsInlineLimit: 4096,
    // chunk大小警告限制
    chunkSizeWarningLimit: 500
  }
})
