import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Cloudflare Pages and local development serve from the root.
// The GitHub Pages workflow sets VITE_BASE=/vastrika/.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
})
