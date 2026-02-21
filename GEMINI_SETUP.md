# Gemini API Setup Guide

## Getting Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

## Setting Up the API Key

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

## How It Works

- The AI Assistant will use Gemini API when the key is configured
- If no API key is provided, it will use basic fallback responses
- The assistant is trained with information about Mann's portfolio, skills, projects, and experience

## GitHub Pages (live site)

For the AI to work on your live site at **https://mehmannj.github.io/Portfolio/**:

1. In your repo go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `VITE_GEMINI_API_KEY`
4. Value: paste your Gemini API key
5. Save, then push any commit to `main` (or re-run the "Deploy to GitHub Pages" workflow) so the site rebuilds with the key

## Security Note

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Keep your API key secure and don't share it publicly
- On GitHub Pages the key is baked into the built JS (visible in browser). For a portfolio demo this is common; for production you could use a server proxy (e.g. Netlify function) to hide the key

