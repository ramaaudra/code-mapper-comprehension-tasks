import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist-report',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/features/report/report-entry.tsx'),
      name: 'CodeMapperReport',
      formats: ['iife'],
      fileName: 'report-bundle'
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/types': path.resolve(__dirname, './src/shared/types'),
      '@/lib': path.resolve(__dirname, './src/shared/lib'),
      '@/hooks': path.resolve(__dirname, './src/shared/hooks'),
      '@/components/ui': path.resolve(__dirname, './src/shared/components/ui')
    }
  }
})
