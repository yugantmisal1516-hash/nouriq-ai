import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures build assets use relative paths for easy previewing
  server: {
    port: 3000,
    open: true
  }
})
