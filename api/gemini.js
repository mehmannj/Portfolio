export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY on server' })
    }
  
    const { userMessage, systemContext } = req.body || {}
    if (!userMessage) {
      return res.status(400).json({ error: 'Missing userMessage' })
    }
  
    // Optional: set in Vercel env as GEMINI_MODEL, else default:
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  
    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemContext}\n\nUser question:\n${userMessage}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 700
      }
    }
  
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
  
      const data = await r.json().catch(() => ({}))
  
      if (!r.ok) {
        const msg = data?.error?.message || `Gemini error ${r.status}`
        return res.status(r.status).json({ error: msg })
      }
  
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      return res.status(200).json({ text })
    } catch (err) {
      return res.status(500).json({ error: 'Server error calling Gemini' })
    }
  }