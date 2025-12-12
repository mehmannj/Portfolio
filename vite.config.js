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

export default defineConfig({
  base: '/Portfolio/',
  plugins: [react()],
})


