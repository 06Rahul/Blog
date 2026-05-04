import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@monaco-editor') || id.includes('monaco-editor')) return 'monaco'
          if (id.includes('@react-three') || id.includes('/three/')) return 'three'
          if (id.includes('react-quill')) return 'quill-editor'
          if (id.includes('@tiptap') || id.includes('yjs') || id.includes('y-websocket') || id.includes('lowlight')) return 'tiptap-editor'
          if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('date-fns') || id.includes('react-hot-toast')) return 'ui-vendor'
          if (id.includes('axios') || id.includes('sockjs-client') || id.includes('stompjs')) return 'data-vendor'
          return undefined
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,
      }
    }
  }
})
