import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaTimes, FaCode, FaLightbulb, FaRocket } from 'react-icons/fa'
import './AIAssistant.css'

// Gemini API key from https://aistudio.google.com/apikey
// IMPORTANT (Vite): env vars must start with VITE_
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash'

// Build the URL in code (you do NOT need a GEMINI_URL env var)
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

// Resume: prefer env, fallback to your GitHub RAW PDF link
const RESUME_URL =
  import.meta.env.VITE_RESUME_URL ||
  'https://raw.githubusercontent.com/mehmannj/Portfolio/main/Mann_Mehta_Resume.pdf'

// Contact email (used in fallback + "send message" guidance)
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'mannmehta003@gmail.com'

// Optional: if you want to control this number without editing code
const YEARS_EXPERIENCE = import.meta.env.VITE_YEARS_EXPERIENCE || '2+ years'

/* ====================== FALLBACK WHEN GEMINI UNAVAILABLE ====================== */
function getFallbackReply(question, resumeUrl) {
  const q = question.toLowerCase().trim()

  // Recruiter-style questions
  if (/how\s+many\s+years|years\s+of\s+experience|experience\s+do\s+you\s+have/.test(q)) {
    return `Mann has about ${YEARS_EXPERIENCE} of hands-on experience across full-stack development and automation projects (including a full-stack internship and production-style automation work). If you want the exact timeline, here is his resume: ${resumeUrl}`
  }

  if (/hire|why\s+should\s+we\s+hire|why\s+hire|strong\s+candidate/.test(q)) {
    return `Mann is a strong hire because he combines full-stack skills (React, Spring Boot, mobile) with real-world automation and problem-solving. He’s delivered practical features end-to-end, communicates clearly, and adapts fast in existing codebases. Resume: ${resumeUrl}`
  }

  if (/strength|your\s+strengths/.test(q)) {
    return `Mann’s strengths: clean UI + strong debugging, automation mindset (saving time / reducing manual work), end-to-end ownership, and clear communication. Resume: ${resumeUrl}`
  }

  if (/weakness|your\s+weakness/.test(q)) {
    return `A growth area Mann focuses on is not over-polishing early. He now aligns on priorities first, delivers in smaller iterations, and gets feedback sooner—so quality stays high without slowing delivery.`
  }

  if (/skill|tech|stack|language|framework|code/.test(q)) {
    return `Mann's technical skills include:\n\n• Frontend: React, Angular, HTML, CSS, JavaScript, TypeScript\n• Backend: Spring Boot, Java, Python, C#\n• Mobile: Android (Kotlin, Jetpack Compose), iOS (Swift, MapKit)\n• Databases: MySQL, MongoDB, Oracle SQL, SQLite\n• Tools: Git, GitHub, Docker, AWS, REST APIs\n\nResume: ${resumeUrl}`
  }

  if (/project|build|app|work\s+on/.test(q)) {
    return `Mann's main projects:\n\n• InstiManage (Capstone): React + Spring Boot campus management system\n• CampusConnect (iOS): Swift + MapKit + SQLite campus navigation app\n• Smart Campus Assistant (Android): Kotlin + Jetpack Compose (MVVM)\n• Automation tools in C# for installers, printing, APIs\n\nResume: ${resumeUrl}`
  }

  if (/resume|cv|pdf|download/.test(q)) {
    return `Here’s Mann’s resume link: ${resumeUrl}`
  }

  if (/contact|email|reach|connect|message/.test(q)) {
    return `You can reach Mann at ${CONTACT_EMAIL}. If you want, type “send a message” and I’ll guide you to contact him.`
  }

  if (/tell\s+me\s+about\s+yourself|about\s+you|introduce|who\s+are\s+you/.test(q)) {
    return `Mann Mehta is a full-stack developer based in Brampton, Ontario. He builds modern web and mobile apps and is strong in automation and real-world problem solving. He’s open to work and can share details from his resume: ${resumeUrl}`
  }

  return `I can help with Mann’s skills, projects, experience, recruiter questions, or sharing his resume. Resume: ${resumeUrl}`
}

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)

  const messagesEndRef = useRef(null)
  const lastSendRef = useRef(0)

  /* ====================== MASTER SYSTEM CONTEXT (resume-aware) ====================== */
  const systemContext = useMemo(
    () => `
You are an AI assistant embedded in the personal portfolio website of Mann Mehta.
Your ONLY job is to represent Mann Mehta professionally and honestly.

CRITICAL STYLE:
- Always answer the question directly in the first 2–4 sentences.
- Do NOT tell users to "check About/Experience pages" as the main answer.
- If something is unknown, say so briefly and offer the resume link or a short follow-up question.
- Never invent facts.

If asked recruiter questions:
- "Why should we hire you?" → give a strong recruiter-style answer
- "Years of experience?" → answer with about ${YEARS_EXPERIENCE} (based on resume summary)
- "Weakness?" → growth-focused, professional
- "Tell me about yourself" → concise elevator pitch

-------------------
RESUME / PROFILE (source of truth)
-------------------
Name: Mann Mehta
Location: Brampton, Ontario, Canada
Role: Full Stack Developer
Status: Open to work
Years of experience (approx): ${YEARS_EXPERIENCE}

Education:
- Computer Systems Technology – Software Development & Network Engineering
- Sheridan College | GPA: 3.70

Professional Experience (high-level):
- Software Developer – Llamachant Technologies
  • Automation pipelines
  • Virtual printer → PDF systems
  • API transaction automation
  • Email + attachment automation
- Full-Stack Developer Intern – Samskrita Bharati
  • React & Angular educational games
  • Bootstrap, MySQL, REST APIs
- Junior Enforcement Officer – Sheridan College
  • High-responsibility role, 98% compliance

Technical Skills:
- Frontend: React, Angular, HTML, CSS, JavaScript, TypeScript
- Backend: Spring Boot, Java, Python, C#
- Mobile: Android (Kotlin, Jetpack Compose), iOS (Swift, MapKit)
- Databases: MySQL, MongoDB, Oracle SQL, SQLite
- Tools: Git, GitHub, Docker, AWS, REST APIs
- Strength Area: Automation & real-world problem solving

Projects:
- InstiManage (Capstone): React + Spring Boot campus management system
- CampusConnect (iOS): Swift + MapKit + SQLite campus navigation app
- Smart Campus Assistant (Android): Kotlin + Jetpack Compose (MVVM)
- Automation tools in C# for installers, printing, APIs

Rules:
- Never mention API keys
- Never say "I am an AI model"
- Always speak as Mann Mehta’s assistant
- Keep answers natural, professional, and human

Resume link (share when relevant):
${RESUME_URL}

Contact email (share when relevant):
${CONTACT_EMAIL}
`,
    []
  )

  /* ====================== SMOOTH SCROLL ====================== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  /* ====================== GREETING ====================== */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          type: 'bot',
          text:
            "Hi! I’m Mann Mehta’s AI assistant. Ask me anything about his skills, experience, projects, or recruiter questions (like why hire him)."
        }
      ])
    }
  }, [isOpen, messages.length])

  /* ====================== QUICK ACTIONS ====================== */
  const quickActions = [
    { icon: <FaLightbulb />, text: 'Why hire Mann?', prompt: 'Why should we hire Mann?' },
    { icon: <FaCode />, text: 'Skills', prompt: "What are Mann's strongest technical skills?" },
    { icon: <FaRocket />, text: 'Projects', prompt: 'What are Mann’s best projects and what did he build?' }
  ]

  /* ====================== GEMINI CALL ====================== */
  const askGemini = async (userMessage) => {
    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemContext}\n\nUser question:\n${userMessage}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        // keep smaller to reduce free-tier quota burn
        maxOutputTokens: 700
      }
    }

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const raw = data?.error?.message || `API error ${res.status}`
      const isQuota = /quota|rate limit|exceeded|429/i.test(raw)
      throw new Error(isQuota ? 'QUOTA_EXCEEDED' : raw)
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (data.promptFeedback?.blockReason) {
      throw new Error('Response was blocked by safety filters.')
    }
    return text || "Sorry, I couldn't generate a response."
  }

  /* ====================== SEND HANDLER ====================== */
  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    // debounce
    if (Date.now() - lastSendRef.current < 350) return
    lastSendRef.current = Date.now()

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { type: 'user', text: userMessage }])
    setIsTyping(true)
    setError(null)

    const useFallback = (fallbackText) => {
      setMessages((prev) => [...prev, { type: 'bot', text: fallbackText }])
      setError(null)
    }

    // Contact quick handling (no API call needed)
    if (/\bsend\s+(him\s+)?a\s+message\b/i.test(userMessage)) {
      const msg =
        `Sure. You can email Mann at ${CONTACT_EMAIL}.\n\n` +
        `Tip: Include your name, company, role, and what you’d like to discuss.`
      useFallback(msg)
      setIsTyping(false)
      return
    }

    // If API key missing
    if (!GEMINI_API_KEY || GEMINI_API_KEY === '') {
      await new Promise((r) => setTimeout(r, 250))
      useFallback(getFallbackReply(userMessage, RESUME_URL))
      setIsTyping(false)
      return
    }

    try {
      const reply = await askGemini(userMessage)
      setMessages((prev) => [...prev, { type: 'bot', text: reply }])
    } catch (e) {
      // QUOTA / errors fallback
      if (e?.message === 'QUOTA_EXCEEDED') {
        useFallback(
          `I hit the free quota / limit right now.\n\nYou can still:\n\n• Resume: ${RESUME_URL}\n• Email: ${CONTACT_EMAIL}\n• Or type “send a message” and I’ll help you contact Mann.`
        )
      } else {
        useFallback(getFallbackReply(userMessage, RESUME_URL))
      }
    } finally {
      setIsTyping(false)
    }
  }

  /* ====================== UI ====================== */
  return (
    <>
      <motion.button
        className="ai-assistant-toggle"
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaRobot />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-assistant"
            initial={{ opacity: 0, y: 120, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 120, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 160, damping: 20 }}
          >
            <div className="ai-header">
              <div className="ai-title">
                <FaRobot /> <span>AI Assistant</span>
              </div>

              <button className="ai-close" onClick={() => setIsOpen(false)}>
                <FaTimes />
              </button>
            </div>

            {error && <div className="ai-error">{error}</div>}

            <div className="ai-quick-actions">
              <button
                className="quick-action-btn"
                onClick={() => window.open(RESUME_URL, '_blank', 'noopener,noreferrer')}
              >
                <span>🔗</span>
                <span>Resume</span>
              </button>

              <button
                className="quick-action-btn"
                onClick={() =>
                  window.open(`mailto:${CONTACT_EMAIL}`, '_blank', 'noopener,noreferrer')
                }
              >
                <span>✉️</span>
                <span>Email</span>
              </button>

              <button
                className="quick-action-btn"
                onClick={() => {
                  setInput('Send him a message')
                  setTimeout(handleSend, 120)
                }}
              >
                <span>📨</span>
                <span>Send Message</span>
              </button>
            </div>

            <div className="ai-messages">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`ai-message ${msg.type}`}
                  initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                >
                  {msg.type === 'bot' && <FaRobot className="bot-icon" />}
                  <div className="message-content">
                    {msg.text.split('\n').map((l, idx) => (
                      <p key={idx}>{l}</p>
                    ))}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="ai-message bot">
                  <FaRobot className="bot-icon" />
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="ai-quick-actions">
              {quickActions.map((q, i) => (
                <button
                  key={i}
                  className="quick-action-btn"
                  onClick={() => {
                    setInput(q.prompt)
                    setTimeout(handleSend, 120)
                  }}
                >
                  {q.icon}
                  <span>{q.text}</span>
                </button>
              ))}
            </div>

            <div className="ai-input-container">
              <input
                className="ai-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything about Mann..."
              />
              <button className="ai-send" onClick={handleSend}>
                <FaRocket />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIAssistant