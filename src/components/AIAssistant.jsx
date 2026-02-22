import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaRobot,
  FaTimes,
  FaTrash,
  FaRedo,
  FaEnvelope,
  FaPaperPlane,
  FaLink,
} from "react-icons/fa"
import emailjs from "emailjs-com"
import "./AIAssistant.css"

// ====================== ENV / CONFIG ======================
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash"

// ✅ You do NOT need GEMINI_URL in .env. It is built here:
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "mannmehta003@gmail.com"
const RESUME_URL =
  import.meta.env.VITE_RESUME_URL ||
  "https://github.com/mehmannj/Portfolio/blob/main/Mann_Mehta_Resume.pdf"

// EmailJS (optional but recommended)
const EMAILJS_SERVICE = import.meta.env.VITE_EMAILJS_SERVICE || ""
const EMAILJS_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE || ""
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ""

// ====================== QUOTA SAVERS ======================
const STORAGE_KEY = "portfolio_ai_assistant_messages_v4"
const MAX_TURNS = 6 // smaller memory = fewer tokens
const MAX_OUTPUT_TOKENS = 420 // keep low to reduce quota burn
const SEND_DEBOUNCE_MS = 1000

// ====================== SITE KNOWLEDGE (edit as you wish) ======================
const SITE_KNOWLEDGE = [
  {
    id: "about",
    title: "About Mann",
    tags: ["about", "bio", "summary", "who", "mann"],
    content:
      "Mann Mehta is a Computer Systems Technology student focused on software development, UI, and automation. He builds practical solutions with a clean, user-friendly approach and strong attention to detail.",
  },
  {
    id: "experience",
    title: "Experience Highlights",
    tags: [
      "experience",
      "work",
      "llamachant",
      "intern",
      "automation",
      "full stack",
    ],
    content:
      "Experience includes automation-focused development work (workflow automation, data handling, integrations) and full-stack work with modern web technologies. Comfortable working with real codebases, delivering features, and improving reliability.",
  },
  {
    id: "projects",
    title: "Projects (Portfolio)",
    tags: ["projects", "portfolio", "apps", "react", "spring", "android", "ios"],
    content:
      "Projects include full-stack apps (React + backend), mobile apps (Android/iOS), and automation tools. The portfolio is designed to showcase real-world problem solving and end-to-end implementation.",
  },
  {
    id: "contact",
    title: "Contact",
    tags: ["contact", "email", "message", "connect", "reach"],
    content: `Visitors can contact Mann through the website or directly via email. Email: ${CONTACT_EMAIL}.`,
  },
  {
    id: "resume",
    title: "Resume",
    tags: ["resume", "cv", "pdf", "download"],
    content: `Resume link: ${RESUME_URL}`,
  },
]

// ====================== SMALL RETRIEVAL (site-aware answers) ======================
const scoreChunk = (chunk, q) => {
  const query = String(q || "").toLowerCase()
  let score = 0

  for (const t of chunk.tags || []) {
    if (query.includes(String(t).toLowerCase())) score += 4
  }

  const words = query.split(/\s+/).filter(Boolean)
  for (const w of words) {
    if (chunk.title.toLowerCase().includes(w)) score += 2
    if (chunk.content.toLowerCase().includes(w)) score += 1
  }
  return score
}

const retrieveSiteContext = (question, topK = 3) => {
  const ranked = SITE_KNOWLEDGE
    .map((c) => ({ c, s: scoreChunk(c, question) }))
    .sort((a, b) => b.s - a.s)
    .filter((x) => x.s > 0)
    .slice(0, topK)
    .map((x) => `### ${x.c.title}\n${x.c.content}`)
  return ranked.join("\n\n")
}

// ====================== GEMINI HELPERS ======================
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchWithBackoff(url, options, retries = 3) {
  let wait = 800
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url, options)
    if (res.status !== 429) return res
    if (i === retries) return res
    await sleep(wait)
    wait *= 2
  }
}

const clampHistory = (messages, maxTurns) => {
  const cleaned = (messages || []).filter((m) => m?.text?.trim())
  return cleaned.slice(-maxTurns)
}

const buildGeminiContents = (history) => {
  return history.map((m) => ({
    role: m.type === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }))
}

// ====================== RECRUITER-INSTANT ANSWERS ======================
// These answers are immediate (no Gemini call), so they are fast and save quota.
const normalize = (t) => String(t || "").toLowerCase().trim()

const getInstantRecruiterAnswer = (text) => {
  const t = normalize(text)

  // Why hire / strong candidate
  if (
    t.includes("why should we hire") ||
    t.includes("why hire") ||
    t.includes("strong candidate") ||
    t.includes("why you") ||
    t.includes("why should i hire you")
  ) {
    return `You should hire Mann because he combines strong development fundamentals with real, practical execution—he can take a feature from idea → clean UI → working logic → reliable delivery.

What makes him a strong candidate:
• End-to-end ownership: comfortable building, fixing, and shipping features in real codebases.
• Automation + problem solving: builds tools/workflows that save time, reduce errors, and improve reliability.
• Modern tech comfort: React/JS frontend fundamentals + backend/data exposure, plus strong debugging skills.
• Professional mindset: detail-oriented, communicates clearly, and focuses on outcomes—not just code.
- Always answer recruiter or hiring questions directly first.
- Never tell users to visit pages as the main answer.
- If unsure, ask one short follow-up question.
- Use the SITE CONTEXT below to stay accurate and specific.
- Links:
  - Resume: ${RESUME_URL}
  
If you want, I can share his resume link or help you message Mann right now.`
  }

  // Strengths
  if (t.includes("your strengths") || t.includes("strengths")) {
    return `Mann’s key strengths:
• Strong problem-solving and debugging
• Clean UI mindset (spacing, responsiveness, polish)
• Automation mindset (reducing manual work, improving workflows)
• Fast learner + reliable execution
• Clear communication and ownership

If you tell me the role (Help Desk, QA, Frontend, Full Stack), I can tailor this to match it.`
  }

  // Weakness (safe, positive)
  if (t.includes("weakness") || t.includes("your weakness")) {
    return `One area Mann is actively improving is delegating earlier instead of trying to perfect everything alone. He’s learned to align quickly with stakeholders, confirm priorities early, and deliver in smaller iterations—so quality stays high without slowing delivery.`
  }

  // Projects
  if (t.includes("projects") || t.includes("portfolio projects") || t.includes("what have you built")) {
    return `Mann has built full-stack applications, mobile apps, and automation tools. His projects focus on real-world workflows—clean UI, solid logic, and practical features that users actually need. 

If you tell me what role you’re hiring for, I’ll highlight the most relevant 2–3 projects.`
  }

  // Salary expectations (neutral)
  if (t.includes("salary") || t.includes("compensation") || t.includes("expected pay")) {
    return `Mann is flexible and open to market-aligned compensation based on role scope, location, and growth opportunity. He’s happy to share a range after understanding the responsibilities and the full package (benefits, hybrid/remote, learning, etc.).`
  }

  // Availability / start date
  if (t.includes("when can you start") || t.includes("start date") || t.includes("availability")) {
    return `Mann can start based on the role’s timeline. If needed, he can align quickly—just share your preferred start date and any notice period expectations, and he’ll confirm right away.`
  }

  // Remote / hybrid
  if (t.includes("remote") || t.includes("hybrid") || t.includes("on site") || t.includes("onsite")) {
    return `Mann is open to remote, hybrid, or on-site depending on the role. He adapts well to structured processes and communicates clearly to stay aligned with the team.`
  }

  // Contact
  if (t.includes("contact") || t.includes("email") || t.includes("reach mann")) {
    return `You can contact Mann directly at ${CONTACT_EMAIL}.  
If you want, type “send a message” and I’ll help you send a message from here.`
  }

  // Resume
  if (t.includes("resume") || t.includes("cv")) {
    return `Here’s Mann’s resume link: ${RESUME_URL}`
  }

  return null
}

// ====================== CONTACT FLOW ======================
const detectContactIntent = (text) => {
  const t = normalize(text)
  if (/(send|write|compose)\s+(an\s+)?email/.test(t)) return "email"
  if (/\bemail\b/.test(t) && /(mann|you|him)/.test(t)) return "email"
  if (/(send|drop)\s+(a\s+)?message/.test(t)) return "message"
  if (/\bmessage\b/.test(t) && /(mann|you|him)/.test(t)) return "message"
  if (/\bcontact\b/.test(t)) return "message"
  return null
}

const extractEmail = (text) => {
  const m = String(text || "").match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)
  return m ? m[0] : ""
}

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)

  const [contactFlow, setContactFlow] = useState({
    active: false,
    mode: null, // 'email' | 'message'
    step: 0, // 0 name, 1 email, 2 message
    name: "",
    fromEmail: "",
    message: "",
  })

  const messagesEndRef = useRef(null)
  const lastSendRef = useRef(0)

  // ✅ Cache to reduce repeated calls
  const cacheRef = useRef(new Map())

  // init EmailJS
  useEffect(() => {
    if (!EMAILJS_PUBLIC_KEY) return
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY)
    } catch {
      // ignore
    }
  }, [])

  // scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // load chat
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  // save chat
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // ignore
    }
  }, [messages])

  // greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          type: "bot",
          text:
            "Hi! I’m Mann Mehta’s portfolio assistant. Ask anything (skills, experience, projects). If you want to contact Mann, type “send a message”.",
        },
      ])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // System prompt: force DIRECT answers
  const baseSystemContext = useMemo(() => {
    return `
You are the AI assistant embedded in Mann Mehta’s portfolio website.

CRITICAL RESPONSE STYLE:
- Always answer the user’s question directly in the first 2–4 sentences.
- Do NOT respond by telling them to “visit About/Experience” as the main answer.
- You may offer resume/contact links only AFTER answering.
- If unsure, ask one short follow-up question.

Use the SITE CONTEXT below to stay accurate and specific.

Links:
- Resume: ${RESUME_URL}
- Email: ${CONTACT_EMAIL}
`
  }, [])

  const openEmailDraft = ({ subject, body }) => {
    const link =
      `mailto:${encodeURIComponent(CONTACT_EMAIL)}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`
    window.open(link, "_blank", "noopener,noreferrer")
  }

  const sendViaEmailJS = async ({ name, fromEmail, message }) => {
    if (!EMAILJS_SERVICE || !EMAILJS_TEMPLATE || !EMAILJS_PUBLIC_KEY) {
      throw new Error("EmailJS not configured.")
    }
    const templateParams = {
      name: name || "Website Visitor",
      email: fromEmail || "",
      message: message || "",
    }
    await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, templateParams, EMAILJS_PUBLIC_KEY)
    return true
  }

  const callGemini = async (fullMessageList, userMessage) => {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not defined (set VITE_GEMINI_API_KEY in .env).")

    // cache repeated
    const cacheKey = normalize(userMessage)
    if (cacheRef.current.has(cacheKey)) return cacheRef.current.get(cacheKey)

    const siteContext = retrieveSiteContext(userMessage)
    const systemContext = `${baseSystemContext}\n\nSITE CONTEXT:\n${siteContext || "No extra site context found."}`

    const history = clampHistory(fullMessageList, MAX_TURNS)
    const body = {
      system_instruction: { parts: [{ text: systemContext }] },
      contents: buildGeminiContents(history),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      },
    }

    const res = await fetchWithBackoff(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const raw = data?.error?.message || `API error ${res.status}`
      throw new Error(raw)
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    const finalText = text || "Sorry, I couldn’t generate a response."
    cacheRef.current.set(cacheKey, finalText)
    return finalText
  }

  const clearChat = () => {
    setError(null)
    setInput("")
    setIsTyping(false)
    setContactFlow({ active: false, mode: null, step: 0, name: "", fromEmail: "", message: "" })
    cacheRef.current.clear()
    setMessages([
      {
        type: "bot",
        text: "Chat cleared. Ask anything, or type “send a message” to contact Mann.",
      },
    ])
  }

  const regenerate = async () => {
    if (isTyping) return

    const lastUserIndex = [...messages]
      .map((m, idx) => ({ m, idx }))
      .reverse()
      .find((x) => x.m.type === "user")?.idx

    if (lastUserIndex === undefined) return

    const trimmed = messages.slice(0, lastUserIndex + 1)
    const lastUserText = trimmed[lastUserIndex]?.text || ""
    setMessages(trimmed)
    await handleSend(lastUserText, "regenerate")
  }

  const handleContactFlowInput = async (userText) => {
    const text = String(userText || "").trim()
    const step = contactFlow.step

    if (step === 0) {
      const name = text.length < 2 ? "Website Visitor" : text
      setContactFlow((p) => ({ ...p, name, step: 1 }))
      setMessages((prev) => [...prev, { type: "bot", text: "Nice! What’s your email (so Mann can reply)?" }])
      return true
    }

    if (step === 1) {
      const email = extractEmail(text)
      if (!email) {
        setMessages((prev) => [...prev, { type: "bot", text: "Please enter a valid email address (example: name@gmail.com)." }])
        return true
      }
      setContactFlow((p) => ({ ...p, fromEmail: email, step: 2 }))
      setMessages((prev) => [...prev, { type: "bot", text: "Great. Now type your message for Mann:" }])
      return true
    }

    if (step === 2) {
      if (text.length < 5) {
        setMessages((prev) => [...prev, { type: "bot", text: "Please write a slightly longer message." }])
        return true
      }

      const payload = { name: contactFlow.name, fromEmail: contactFlow.fromEmail, message: text }
      setIsTyping(true)
      setError(null)

      try {
        await sendViaEmailJS(payload)
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: "Sent ✅ Mann will get your message soon." },
        ])
      } catch {
        const subject = `Portfolio inquiry from ${payload.name}`
        const body =
          `Hi Mann,\n\n${payload.message}\n\nFrom:\nName: ${payload.name}\nEmail: ${payload.fromEmail}\n`
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: "I couldn’t send from the site, so I opened an email draft for you." },
        ])
        openEmailDraft({ subject, body })
      } finally {
        setIsTyping(false)
        setContactFlow({ active: false, mode: null, step: 0, name: "", fromEmail: "", message: "" })
      }

      return true
    }

    return false
  }

  const handleSend = async (overrideText = null, mode = "normal") => {
    if (isTyping) return

    const text = String(overrideText ?? input).trim()
    if (!text) return

    if (Date.now() - lastSendRef.current < SEND_DEBOUNCE_MS) return
    lastSendRef.current = Date.now()

    setError(null)
    setInput("")

    if (mode !== "regenerate") setMessages((prev) => [...prev, { type: "user", text }])

    // Contact flow ongoing?
    if (contactFlow.active) {
      const handled = await handleContactFlowInput(text)
      if (handled) return
    }

    // Start contact flow?
    const intent = detectContactIntent(text)
    if (intent) {
      setContactFlow({ active: true, mode: intent, step: 0, name: "", fromEmail: "", message: "" })
      setMessages((prev) => [...prev, { type: "bot", text: "Sure — what’s your name?" }])
      return
    }

    // ✅ Instant recruiter answers (direct, strong)
    const instant = getInstantRecruiterAnswer(text)
    if (instant) {
      setMessages((prev) => [...prev, { type: "bot", text: instant }])
      return
    }

    // Gemini
    setIsTyping(true)
    try {
      await sleep(200 + Math.random() * 200)

      const workingMessages =
        mode === "regenerate"
          ? [...messages]
          : [...messages, { type: "user", text }]

      const reply = await callGemini(workingMessages, text)
      setMessages((prev) => [...prev, { type: "bot", text: reply }])
    } catch (e) {
      const msg = e?.message || "AI is temporarily unavailable."
      setError(msg)
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text:
            `I can’t reach the AI right now.\n\nYou can still:\n` +
            `• Resume: ${RESUME_URL}\n` +
            `• Email: ${CONTACT_EMAIL}\n` +
            `• Or type “send a message” and I’ll help you contact Mann.`,
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const emailLink = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Connecting from your portfolio")}`

  const quickActions = [
    {
      label: "Resume",
      icon: <FaLink />,
      onClick: () => window.open(RESUME_URL, "_blank", "noopener,noreferrer"),
    },
    {
      label: "Email",
      icon: <FaEnvelope />,
      onClick: () => window.open(emailLink, "_blank", "noopener,noreferrer"),
    },
    {
      label: "Send Message",
      icon: <FaPaperPlane />,
      onClick: () => {
        setMessages((prev) => [...prev, { type: "user", text: "I want to send Mann a message." }])
        setContactFlow({ active: true, mode: "message", step: 0, name: "", fromEmail: "", message: "" })
        setMessages((prev) => [...prev, { type: "bot", text: "Sure — what’s your name?" }])
      },
    },
  ]

  return (
    <>
      <motion.button
        className="ai-assistant-toggle"
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
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
            transition={{ type: "spring", stiffness: 160, damping: 20 }}
          >
            <div className="ai-header">
              <div className="ai-title">
                <FaRobot /> <span>AI Assistant</span>
              </div>

              <div className="ai-header-actions">
                <button className="ai-icon-btn" onClick={regenerate} title="Regenerate" disabled={isTyping}>
                  <FaRedo />
                </button>

                <button className="ai-icon-btn" onClick={clearChat} title="Clear chat">
                  <FaTrash />
                </button>

                <button className="ai-close" onClick={() => setIsOpen(false)} title="Close">
                  <FaTimes />
                </button>
              </div>
            </div>

            {error && <div className="ai-error">{error}</div>}

            <div className="ai-quick-actions">
              {quickActions.map((a, i) => (
                <button key={i} className="quick-action-btn" onClick={a.onClick} disabled={isTyping}>
                  <span className="qa-icon">{a.icon}</span>
                  <span className="qa-text">{a.label}</span>
                </button>
              ))}
            </div>

            <div className="ai-messages">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`ai-message ${msg.type}`}
                  initial={{ opacity: 0, x: msg.type === "user" ? 18 : -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                >
                  {msg.type === "bot" && <FaRobot className="bot-icon" />}
                  <div className="message-content">
                    {String(msg.text)
                      .split("\n")
                      .filter((line) => line !== "")
                      .map((line, idx) => (
                        <p key={idx}>{line}</p>
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

            <div className="ai-input-container">
              <input
                className="ai-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask anything… or type 'send a message'…"
                disabled={isTyping}
              />
              <button className="ai-send" onClick={() => handleSend()} disabled={isTyping}>
                <FaPaperPlane />
              </button>
            </div>

            <div className="ai-footer-note">
              Recruiter-ready answers + quota-saving mode (cache, small memory, low tokens).
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIAssistant