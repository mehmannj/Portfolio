# Quick Setup Guide for Gemini API

## ✅ Your API Key is Already Configured!

Your `.env` file has been created with your Gemini API key.

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

2. **Verify the content**: The `.env` file should contain:
   ```
   VITE_GEMINI_API_KEY=AIzaSyCqwoNIxOW-hKrpPR4UZ96w80pD-1V_Op8
   ```
   (No spaces around the `=` sign!)

3. **Hard refresh browser**: Press `Ctrl + Shift + R` or `Ctrl + F5`

4. **Check browser console**: Open DevTools (F12) and check for any errors

## 🔒 Security Note

- Your `.env` file is already in `.gitignore` - it won't be committed to git
- Never share your API key publicly
- If you need a new key: https://makersuite.google.com/app/apikey

