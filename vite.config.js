import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  const isVercel = !!process.env.VERCEL
  const isNetlify = !!process.env.NETLIFY
  const isGitHubActions = !!process.env.GITHUB_ACTIONS

  // GitHub Pages (project site) needs /<repo>/
  // Vercel/Netlify/local should be '/'
  const base = isGitHubActions ? '/Portfolio/' : '/'

  return {
    base,
    plugins: [react()],
    server: {
      port: 3000,
      open: true
    }
  }
})