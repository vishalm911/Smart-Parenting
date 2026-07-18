import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    headers: {
      'Cache-Control': 'no-store',
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@emotion/react',
      '@emotion/styled',
      'three'
    ]
  },
  resolve: {
    alias: {
      'react-three-fiber': '@react-three/fiber'
    },
    dedupe: ['react', 'react-dom', 'three', '@emotion/react', '@emotion/styled']
  }
})
