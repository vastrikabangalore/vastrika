import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// `base` matches the GitHub Pages project path: https://<user>.github.io/vastrika/
export default defineConfig({
  plugins: [react()],
  base: '/vastrika/',
})
