import { getStore } from '@netlify/blobs'

export const handler = async (event) => {
  try {
    // Allow only POST
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    // Validate content-type
    const contentType = event.headers['content-type'] || ''
    if (!contentType.includes('application/json')) {
      return { statusCode: 400, body: 'Invalid content type' }
    }

    const body = JSON.parse(event.body || '{}')
    const prompt = String(body.prompt || '')
    const model = String(body.model || 'gemini-2.5-flash')

    if (!prompt || prompt.length < 5) {
      return { statusCode: 400, body: 'Prompt is required' }
    }

    // Hard payload limit (security)
    if (prompt.length > 20000) {
      return { statusCode: 413, body: 'Prompt too large' }
    }

    // ===== RATE LIMIT (per IP) =====
    const ip =
      (event.headers['x-nf-client-connection-ip'] ||
        event.headers['x-forwarded-for'] ||
        'unknown')
        .split(',')[0]
        .trim()

    const store = getStore('ai-rate-limit')
    const windowMs = 10 * 60 * 1000 // 10 minutes
    const limit = 30               // 30 requests / window
    const now = Date.now()
    const key = `ip:${ip}`

    let record = await store.get(key, { type: 'json' }).catch(() => null)
    if (!record || typeof record !== 'object') {
      record = { count: 0, start: now }
    }

    if (now - record.start > windowMs) {
      record = { count: 0, start: now }
    }

    record.count += 1
    await store.set(key, record, { ttl: 60 * 60 })

    if (record.count > limit) {
      return {
        statusCode: 429,
        body: 'Too many requests. Please try again later.'
      }
    }

    // ===== GEMINI API =====
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    if (!GEMINI_API_KEY) {
      return {
        statusCode: 500,
        body: 'Server misconfigured: GEMINI_API_KEY missing'
      }
    }

    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=` +
      encodeURIComponent(GEMINI_API_KEY)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.5,
          topP: 0.9,
          maxOutputTokens: 900
        }
      })
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const msg = data?.error?.message || 'Gemini API error'
      return { statusCode: 502, body: msg }
    }

    const output =
      data?.candidates?.[0]?.content?.parts
        ?.map(p => p.text)
        .filter(Boolean)
        .join('') ||
      "I couldn't generate a response."

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ output })
    }
  } catch (err) {
    console.error('Gemini proxy error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Internal server error' })
    }
  }
}
