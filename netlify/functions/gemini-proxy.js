exports.handler = async function (event, context) {
  try {
    let GoogleGenAI
    let googleAvailable = false
    try {
      // Attempt to require the Gemini SDK. If it's available we'll use it.
      GoogleGenAI = require('@google/genai').GoogleGenAI
      googleAvailable = true
    } catch (modErr) {
      console.warn('Gemini SDK not available, will attempt OpenAI fallback if configured:', modErr.message)
      googleAvailable = false
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

    // Prefer a server-side Gemini key. If not present and OpenAI key exists,
    // we'll use OpenAI as a fallback.
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || ''
    const openaiKey = process.env.OPENAI_API_KEY || ''

    let client = null
    if (googleAvailable && geminiKey) {
      client = new GoogleGenAI({ apiKey: geminiKey })
    }

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

    let output = null

    if (client) {
      // Use Gemini SDK
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
      output = response?.text || response?.output || JSON.stringify(response)
    } else if (openaiKey) {
      // Fallback to OpenAI Chat Completions API (gpt-3.5-turbo)
      try {
        const fetch = globalThis.fetch || require('node-fetch')
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful assistant for Mann Mehta\'s portfolio site.' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 800,
            temperature: 0.7
          })
        })

        if (!openaiRes.ok) {
          const errText = await openaiRes.text()
          throw new Error(`OpenAI error: ${openaiRes.status} ${errText}`)
        }
        const openaiJson = await openaiRes.json()
        output = openaiJson?.choices?.[0]?.message?.content || JSON.stringify(openaiJson)
      } catch (openErr) {
        console.error('OpenAI fallback failed:', openErr)
        output = null
      }
    }

    if (!output) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "No AI provider configured (GEMINI or OPENAI). Set GEMINI_API_KEY or OPENAI_API_KEY in your host." })
      }
    }

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
