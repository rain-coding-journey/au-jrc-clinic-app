import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/au-jrc-clinic-app/',
  build: {
    sourcemap: false, // Prevents eval-based sourcemaps in production build
  }
})