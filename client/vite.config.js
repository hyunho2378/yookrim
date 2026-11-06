import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.YOOKRIM_BASE || '/',
  plugins: [react()],
  build: { cssMinify: false },
  server: { port: 5180 }
})
