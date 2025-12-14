// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   // When deploying to GitHub Pages for a project site, set the `base` to '/<repo-name>/'
//   // so asset paths are generated correctly. This repo publishes to https://mehmannj.github.io/Portfolio/
//   base: '/Portfolio/',
//   plugins: [react()],
//   server: {
//     port: 3000,
//     open: true
//   }
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use a dynamic `base` so the same repo can be deployed to GitHub Pages (project site)
// and to Netlify (root site) without editing the config each time.
// Netlify sets the `NETLIFY` env var during builds, so we switch to '/' there.
const isNetlify = typeof process !== 'undefined' && !!process.env.NETLIFY
const base = isNetlify ? '/' : '/Portfolio/'

export default defineConfig({
  base,
  plugins: [react()],
})


