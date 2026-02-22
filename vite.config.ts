import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:5173',
        changeOrigin: true
      }
    }
  },
  build: {
    // Enable tree-shaking and optimization
    minify: 'esbuild',
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'react-flow': ['@xyflow/react', '@dagrejs/dagre'],
          'ui-components': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-label',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tooltip'
          ],
          'tree-view': ['react-arborist'],
          // Icons are now optimized through centralized imports
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority']
        }
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (optional)
    sourcemap: false
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', '@xyflow/react', 'react-arborist'],
    exclude: ['lucide-react']
  }
})
