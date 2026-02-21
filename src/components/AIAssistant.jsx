import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaTimes, FaCode, FaLightbulb, FaRocket } from 'react-icons/fa'
import './AIAssistant.css'

// Free Gemini API key from https://aistudio.google.com/apikey
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

/* ====================== FALLBACK WHEN GEMINI UNAVAILABLE ====================== */
function getFallbackReply (question, resumeUrl) {
  const q = question.toLowerCase().trim()
  if (/hire|why|recruit|choose|pick/.test(q)) {
    return `Mann is a strong hire because he combines full-stack skills (React, Spring Boot, mobile) with real-world experience in automation and problem-solving. He's been a Software Developer at Llamachant Technologies and a Full-Stack Intern at Samskrita Bharati, with a 3.70 GPA from Sheridan College. He's practical, a fast learner, and communicates well with both technical and non-technical teams. You can see his full background in his resume: ${resumeUrl}`
  }
  if (/skill|tech|stack|language|framework|code/.test(q)) {
    return `Mann's technical skills include:\n\n• Frontend: React, Angular, HTML, CSS, JavaScript, TypeScript\n• Backend: Spring Boot, Java, Python, C#\n• Mobile: Android (Kotlin, Jetpack Compose), iOS (Swift, MapKit)\n• Databases: MySQL, MongoDB, Oracle SQL, SQLite\n• Tools: Git, GitHub, Docker, AWS, REST APIs\n\nHis strength area is automation and real-world problem solving. Resume: ${resumeUrl}`
  }
  if (/project|build|app|work\s+on/.test(q)) {
    return `Mann's main projects:\n\n• InstiManage (Capstone): React + Spring Boot campus management system\n• CampusConnect (iOS): Swift + MapKit + SQLite campus navigation app\n• Smart Campus Assistant (Android): Kotlin + Jetpack Compose (MVVM)\n• Automation tools in C# for installers, printing, and APIs\n\nMore details are on his portfolio and in his resume: ${resumeUrl}`
  }
  if (/experience|job|work|role|career/.test(q)) {
    return `Mann's experience:\n\n• Software Developer – Llamachant Technologies (automation, PDF systems, APIs, email automation)\n• Full-Stack Developer Intern – Samskrita Bharati (React & Angular educational games, Bootstrap, MySQL, REST APIs)\n• Junior Enforcement Officer – Sheridan College (high-responsibility, 98% compliance)\n\nHe's currently open to work. Resume: ${resumeUrl}`
  }
  if (/resume|cv|pdf|download/.test(q)) {
    return `You can view or download Mann's resume here: ${resumeUrl}`
  }
  if (/about|who|tell\s+me|know\s+more|intro|yourself/.test(q)) {
    return `Mann Mehta is a Full Stack Developer based in Brampton, Ontario, open to work. He has a diploma in Computer Systems Technology (Software Development & Network Engineering) from Sheridan College (GPA 3.70), and experience in software development, full-stack internships, and automation. He's practical, a fast learner, and strong at problem-solving. Ask about his skills, projects, or why to hire him—or check his resume: ${resumeUrl}`
  }
  if (/contact|email|reach|connect/.test(q)) {
    return `You can reach Mann at mannmehta003@gmail.com or through the Contact section on this portfolio. He's based in Brampton, ON and open to new opportunities.`
  }
  if (/education|college|degree|gpa|sheridan/.test(q)) {
    return `Mann studied Computer Systems Technology – Software Development & Network Engineering at Sheridan College, with a GPA of 3.70.`
  }
  return `I'm not sure how to answer that right now. You can ask about Mann's skills, projects, experience, why to hire him, or his resume. Resume: ${resumeUrl}`
}

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)

  const messagesEndRef = useRef(null)
  const lastSendRef = useRef(0)

  const RESUME_URL = `${import.meta.env.BASE_URL || '/'}MannMehtaResume.pdf`

  /* ====================== MASTER SYSTEM CONTEXT ====================== */
  const systemContext = useMemo(
    () => `
You are an AI assistant embedded in the personal portfolio website of Mann Mehta.
Your ONLY job is to represent Mann Mehta professionally and honestly.

You must:
- Answer ANY type of question (technical, recruiter, casual, behavioral, personal)
- Always relate answers back to Mann Mehta, his skills, experience, mindset, or projects
- Be confident, clear, and human
- Never invent facts

If asked:
- "Why should we hire you?" → give a strong recruiter-style answer
- "What are your weaknesses?" → give a professional growth-focused answer
- "Tell me about yourself" → concise elevator pitch
- "Random or casual questions" → respond politely, then redirect to Mann

-------------------
PROFILE — MANN MEHTA
-------------------
Name: Mann Mehta
Location: Brampton, Ontario, Canada
Role: Full Stack Developer
Status: Open to work

Education:
- Computer Systems Technology – Software Development & Network Engineering
- Sheridan College | GPA: 3.70

Professional Experience:
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

Personality & Work Style:
- Practical, fast learner
- Strong problem-solving mindset
- Reliable, calm under pressure
- Strong communication with technical & non-technical users

Rules:
- Never mention API keys
- Never say "I am an AI model"
- Always speak as Mann Mehta’s assistant
- Keep answers natural, professional, and human

Resume link (share when relevant):
${RESUME_URL}
`,
    [RESUME_URL]
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
            "Hi! I’m Mann Mehta’s AI assistant. You can ask me anything about his skills, experience, projects, or why he’d be a great hire."
        }
      ])
    }
  }, [isOpen]) // eslint-disable-line

  /* ====================== GEMINI CALL ====================== */
  const callGemini = async (userMessage) => {
    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemContext}\n\nUser question:\n${userMessage}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
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

    // debounce for responsiveness
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

    if (!GEMINI_API_KEY || GEMINI_API_KEY === '') {
      await new Promise((r) => setTimeout(r, 300))
      useFallback(getFallbackReply(userMessage, RESUME_URL))
      setIsTyping(false)
      return
    }

    try {
      // human thinking delay
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 300))
      const reply = await callGemini(userMessage)
      setMessages((prev) => [...prev, { type: 'bot', text: reply }])
    } catch (err) {
      const raw = err?.message || 'AI is temporarily unavailable.'
      const isQuota = raw === 'QUOTA_EXCEEDED' || /quota|rate limit|exceeded/i.test(raw)
      setError(isQuota ? 'Usage limit reached. Showing a quick answer below.' : raw)
      useFallback(getFallbackReply(userMessage, RESUME_URL))
    } finally {
      setIsTyping(false)
    }
  }

  /* ====================== QUICK ACTIONS ====================== */
  const quickActions = [
    { icon: <FaCode />, text: 'Skills', prompt: 'What are Mann Mehta’s skills?' },
    { icon: <FaRocket />, text: 'Projects', prompt: 'Explain Mann Mehta’s projects in detail' },
    { icon: <FaLightbulb />, text: 'Why Hire', prompt: 'Why should we hire Mann Mehta?' }
  ]

  return (
    <>
      <motion.button
        className="ai-assistant-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Assistant"
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
