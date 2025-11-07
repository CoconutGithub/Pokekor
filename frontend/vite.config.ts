import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// [https://vitejs.dev/config/](https://vitejs.dev/config/)
export default defineConfig({
  plugins: [react()],
  server: {
    // [추가] 프록시 설정
    proxy: {
      // '/api'로 시작하는 모든 요청을
      '/api': {
        // 'http://localhost:8080' (Spring Boot 서버)로 보냅니다.
        target: 'http://localhost:8080',
        changeOrigin: true, // CORS 에러 방지를 위해 필요
      }
    }
  }
})