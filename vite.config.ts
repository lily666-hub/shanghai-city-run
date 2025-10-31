import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // 暂时移除 basicSsl()
  server: {
    https: false, // 暂时禁用 HTTPS
    host: '0.0.0.0',
    port: 5174
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // 忽略 TypeScript 相关的警告
        if (warning.code === 'UNRESOLVED_IMPORT') return;
        warn(warning);
      }
    }
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})
