# Deploying this portfolio to GitHub Pages

This repository uses Vite. The project already has a `build` script (`vite build`). The workflow `/.github/workflows/deploy-pages.yml` will build and deploy the `dist` folder to GitHub Pages automatically on pushes to the `main` branch.

Quick steps to activate deployment:

1. Create a repository on GitHub (if you haven't) and push this project to it. Example (PowerShell):

```powershell
cd 'c:\Users\mehta\Documents\Portfolio'
git init
git add .
git commit -m "Initial"
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

2. After pushing, GitHub Actions will run the workflow. The Pages site will be published automatically. You can view Pages status in `Settings -> Pages` for the repo.

Notes & optional tweaks:

- If you intend to publish as a project page at `https://<user>.github.io/<repo>/`, set `base` in `vite.config.js` to `'/<repo>/'` so asset paths are correct. Example:

```js
// vite.config.js
export default defineConfig({
  base: '/<repo>/',
  plugins: [react()],
})
```

- If you prefer the older `gh-pages` branch approach or a different CI, let me know and I can add that instead.
- If your repo is private, Pages deployments are supported but may require additional configuration or a paid plan for custom domains.
 
Functions & server dependencies (Netlify)
- If you use Netlify functions (this project includes `netlify/functions/gemini-proxy.js`) the server-side code depends on the Node package `@google/genai`.
- Ensure `@google/genai` is listed in `package.json` (it is included by default). Netlify installs dependencies during the build. If you get a function error mentioning the module is missing, run locally:

```powershell
npm install @google/genai
git add package.json package-lock.json
git commit -m "Add @google/genai dependency"
git push
```

Then trigger a new Netlify deploy (push or redeploy from Netlify). Also ensure the `VITE_GEMINI_API_KEY` environment variable is set in the Netlify dashboard.

If you want, I can push the workflow and test a build by running the dev server or creating a branch/push for you — tell me which GitHub repo URL to use and I can prepare the next steps.
