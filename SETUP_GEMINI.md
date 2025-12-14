# Quick Setup Guide for Gemini API

## ✅ Your API Key is NOT stored in the repo (recommended)

Your project expects a server-side Gemini API key to be configured in your host
or a local `.env` for development. Do NOT commit keys to source control.

## 🔄 To Activate Gemini AI:

### Step 1: Stop Your Current Dev Server
- Press `Ctrl + C` in the terminal where `npm run dev` is running

### Step 2: Restart the Dev Server
```bash
npm run dev
```

### Step 3: Verify It's Working
1. Open your browser (should auto-open at http://localhost:3000)
2. Click the robot icon in the bottom right corner
3. The header should now say **"AI Assistant (Gemini)"** instead of "(Basic)"
4. The warning message should disappear
5. Try asking a question - it will use Gemini AI!

## 🧪 Test It Out

Try asking:
- "Tell me about Mann's automation projects"
- "What technologies does Mann use?"
- "What is Mann's experience?"

## ❌ If It Still Shows "(Basic)":

1. **Check the .env file location**: Make sure `.env` is in the root directory (same folder as `package.json`)

2. **Verify the content**: Your `.env` should contain a placeholder or local key for development only.
   For production, set the server-side `GEMINI_API_KEY` in your hosting provider (Netlify or Actions).
   Example (local only):
   ```
   # local development only - do NOT commit
   VITE_GEMINI_API_KEY=your_local_test_key
   ```

3. **Hard refresh browser**: Press `Ctrl + Shift + R` or `Ctrl + F5`

4. **Check browser console**: Open DevTools (F12) and check for any errors

## 🔒 Security Note

- Your `.env` file is already in `.gitignore` - it won't be committed to git
- Never share your API key publicly
- If you need a new key: https://makersuite.google.com/app/apikey

