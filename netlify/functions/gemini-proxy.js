exports.handler = async function (event, context) {
  try {
    let GoogleGenAI
    try {
      // Attempt to require the server SDK. If it's not installed, return a helpful error.
      GoogleGenAI = require('@google/genai').GoogleGenAI
    } catch (modErr) {
      console.error('Missing @google/genai module:', modErr)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Server error: '@google/genai' module not found. Run 'npm install @google/genai' and redeploy." })
      }
    }
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const body = JSON.parse(event.body || '{}')
    const prompt = body.prompt || ''
    const model = body.model || 'gemini-2.5-flash'

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
