import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Relative paths let the admin run from any folder, including GitHub Pages.
  base: './',
  plugins: [react()],
  server: { port: 5174 },
})
