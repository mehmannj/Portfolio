exports.handler = async function (event, context) {
  try {
    let GoogleGenAI
    try {
      // Attempt to require the server SDK. If it's not installed, we'll
      // fall back to light-weight canned responses for public information
      // such as the resume link instead of failing entirely.
      GoogleGenAI = require('@google/genai').GoogleGenAI
    } catch (modErr) {
      console.error('Missing @google/genai module:', modErr)

      // If the request asks about the resume, provide a public resume link
      // from the environment or a default relative path.
      try {
        if (event.httpMethod === 'POST') {
          const bodyText = event.body || '{}'
          const parsed = JSON.parse(bodyText)
          const promptText = (parsed.prompt || '').toLowerCase()
          const resumeUrl = process.env.RESUME_URL || '/resume.pdf'

          if (/resume|cv|curriculum vitae|download my resume/.test(promptText)) {
            return {
              statusCode: 200,
              body: JSON.stringify({ output: `You can download the resume here: ${resumeUrl}` })
            }
          }
        }
      } catch (e) {
        console.error('Fallback resume handler error:', e)
      }

      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Server error: '@google/genai' module not found. Run 'npm install @google/genai' and redeploy." })
      }
    }
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const body = JSON.parse(event.body || '{}')
    let prompt = body.prompt || ''
    const model = body.model || 'gemini-2.5-flash'

    // Optional: include a server-side profile context if requested.
    // The client must provide the correct PROFILE secret header to allow
    // the server to include sensitive profile details. This prevents the
    // profile from being included without authorization.
    const includeProfile = !!body.includeProfile
    const profileSecretHeader = (event.headers && (event.headers['x-profile-secret'] || event.headers['X-Profile-Secret'])) || ''

    // Prefer a server-side key name. Avoid using VITE_ prefixed keys in production
    // because those are exposed to the browser when Vite bundles the app.
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Gemini API key not configured on server. Set GEMINI_API_KEY in your host (e.g., Netlify) and redeploy.' })
      }
    }

    const client = new GoogleGenAI({ apiKey })

    // If requested and authorized, load the server-side profile and prepend
    // it to the prompt so Gemini can answer using the user's details.
    if (includeProfile && process.env.PROFILE_SECRET && profileSecretHeader === process.env.PROFILE_SECRET) {
      const fs = require('fs')
      const path = require('path')
      const profilePath = path.join(__dirname, '..', 'data', 'profile.json')
      try {
        if (fs.existsSync(profilePath)) {
          const raw = fs.readFileSync(profilePath, 'utf8')
          const profile = JSON.parse(raw)
          // Prepend profile as system instruction/context
          prompt = `User profile information:\n${JSON.stringify(profile, null, 2)}\n\n` + prompt
        }
      } catch (pfErr) {
        console.error('Failed to load profile:', pfErr)
      }
    }

    const response = await client.models.generateContent({
      model,
      contents: prompt,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    })

    // SDK returns structured output; prefer `.text` or suitable field
    const output = response?.text || response?.output || JSON.stringify(response)

    return {
      statusCode: 200,
      body: JSON.stringify({ output })
    }
  } catch (err) {
    console.error('Gemini proxy error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Unknown error' })
    }
  }
}
