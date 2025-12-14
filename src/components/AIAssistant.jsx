import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaTimes, FaCode, FaLightbulb, FaRocket } from 'react-icons/fa'
import './AIAssistant.css'

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)

  // New controls
  const [tone, setTone] = useState('recruiter') // recruiter | casual
  const [language, setLanguage] = useState('auto') // auto | en | hi | fr
  const [interviewOn, setInterviewOn] = useState(false)
  const [interviewRole, setInterviewRole] = useState('Full Stack Developer') // can expand
  const lastResumeSentRef = useRef(0)

  const RESUME_URL = `${import.meta.env.BASE_URL || '/'}MannMehtaResume.pdf`

  // ===== SEO SUMMARY (indexable) =====
  // This renders in the DOM even if the chat is closed. Keep it visually hidden but NOT display:none.
  const seoSummaryText = useMemo(() => {
    return `Mann Mehta is a Full Stack Developer based in Brampton, Ontario (Canada), open to work. 
He has 1+ year professional experience focused on automation, full-stack web development (React, Spring Boot), and mobile apps (iOS Swift/MapKit and Android Kotlin/Jetpack Compose).
Key projects include InstiManage (React + Spring Boot capstone with bookings, dashboards, and RBAC), CampusConnect (iOS Swift + MapKit with SQLite), and Smart Campus Assistant (Android MVVM with Room).
Experience includes Software Developer at Llamachant Technologies (automation pipelines, virtual printer to PDF, API and email automation) and Full-Stack Developer Intern at Samskrita Bharati (educational games using React/Angular/Bootstrap/MySQL).`
  }, [])

  const jsonLd = useMemo(() => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Mann Mehta',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Brampton',
        addressRegion: 'ON',
        addressCountry: 'CA'
      },
      email: 'mehtamann16@gmail.com',
      url: 'https://github.com/mehmannj',
      sameAs: ['https://github.com/mehmannj', 'https://www.linkedin.com/in/mann-mehta-17b819252'],
      jobTitle: 'Full Stack Developer',
      knowsAbout: [
        'Automation',
        'React',
        'Spring Boot',
        'Kotlin',
        'Jetpack Compose',
        'Swift',
        'MapKit',
        'SQLite',
        'Docker',
        'AWS'
      ]
    }
    return JSON.stringify(data)
  }, [])

  // ===== STRONG PROFILE-LOCKED CONTEXT =====
  const systemContext = useMemo(() => `
You are an AI assistant that represents ONLY Mann Mehta and his portfolio.
You must answer using ONLY the profile below. Do NOT invent facts.

If the user asks in any format (casual/recruiter/technical/story), interpret intent and answer fully.
If the question is unrelated, redirect to Mann’s skills, projects, experience, or contact.

Tone rules:
- recruiter: professional, structured, hiring-focused, confident, skimmable headings.
- casual: friendly, conversational, simple explanations.

Language rules:
- If language is "auto", reply in the user’s language.
- If a language is specified, always reply in that language.
- Keep technical terms in English when appropriate.

Resume rule:
- Include the resume link when the user asks for it OR when the user shows recruiter intent (hiring, resume, interview, contact, experience).
- Do not spam the resume link repeatedly if it was just shared.

Interview mode rule:
- If Interview Mode is ON: act as an interviewer for the selected role.
- Ask ONE question at a time.
- Wait for the user’s answer.
- Then give feedback (strengths + improvements) and ask the next question.
- Keep questions aligned to Mann’s actual profile/projects.

====================
PROFILE — MANN MEHTA
====================
Name: Mann Mehta
Location: Brampton, ON, Canada
Status: Open to work
Email: mehtamann16@gmail.com
GitHub: https://github.com/mehmannj
LinkedIn: https://www.linkedin.com/in/mann-mehta-17b819252
Resume: ${RESUME_URL}

Summary:
Full Stack Developer with 1+ year professional experience. Focus: automation, full-stack web (React, Spring Boot), and mobile (iOS/Android).
Academic: Sheridan College GPA 3.70; Distinction at L.J. Polytechnic.

Skills:
Languages: Java, JavaScript/TypeScript, Python, C#, C, PHP, HTML/CSS
Frameworks/Libraries: React, Angular, Spring Boot, Bootstrap, jQuery, JavaFX
Databases: MySQL, MongoDB, Oracle SQL, SQLite
DevOps/Tools: Git/GitHub, Docker, AWS, VS Code, Android Studio
Mobile: Swift/MapKit (iOS), Kotlin/Jetpack Compose (Android)
Other: API integration, automation pipelines, browser automation, email/attachment automation

Experience:
- Software Developer @ Llamachant Technologies (2025): virtual printer to PDF pipeline; microservice automations; browser automation; API transaction download automation; email/attachment automation; monitoring/logging.
- Full-Stack Developer Intern @ Samskrita Bharati (2024): educational mini games with React/Angular/Bootstrap/MySQL; gamification; remote collaboration; Git/GitHub.
- Jr. Enforcement Officer @ Sheridan College (2023–present): 98% compliance validating permits/contracts; communication/stakeholders.

Projects:
- InstiManage (Capstone): React + Spring Boot campus management; bookings, dashboards, RBAC, REST APIs; Scrum Master + developer.
- CampusConnect (iOS): Swift + MapKit; interactive campus maps; SQLite persistence; MVC.
- Smart Campus Assistant (Android): Kotlin + Jetpack Compose; MVVM + Room.
- C# Automation tooling: installer/workflow automation; monitoring/logging.
- SevenQWordGame: Sanskrit vocabulary game (AngularJS + MySQL).
- GraphicGame: C# Windows Forms (OOP).

Do not share phone numbers.
`, [RESUME_URL])

  const greetings = [
    "Hi! I’m Mann’s AI assistant. How can I help?",
    "Hello! Ask me about Mann’s projects, skills, or experience.",
    "Hey! Want a quick overview of Mann’s background?",
    "Welcome! I can share Mann’s work, projects, and resume."
  ]

  // ===== Session memory =====
  useEffect(() => {
    const saved = sessionStorage.getItem('ai_memory_v2')
    if (saved) {
      try { setMessages(JSON.parse(saved)) } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('ai_memory_v2', JSON.stringify(messages))
    }
  }, [messages])

  // Initial greeting (only if no session messages exist)
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = greetings[Math.floor(Math.random() * greetings.length)]
      setMessages([{ type: 'bot', text: greeting }])
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Recruiter intent detector (for resume auto-send + tone)
  const detectRecruiterIntent = (text) => {
    const t = (text || '').toLowerCase()
    return (
      t.includes('resume') ||
      t.includes('cv') ||
      t.includes('hire') ||
      t.includes('hiring') ||
      t.includes('interview') ||
      t.includes('experience') ||
      t.includes('contact') ||
      t.includes('email') ||
      t.includes('linkedin') ||
      t.includes('salary') ||
      t.includes('availability')
    )
  }

  const maybeAppendResume = (answer, recruiterIntent) => {
    const now = Date.now()
    const alreadyHas = (answer || '').includes(RESUME_URL)
    const cooldownMs = 1000 * 60 * 3 // 3 min cooldown
    const canSend = now - (lastResumeSentRef.current || 0) > cooldownMs

    if (!alreadyHas && recruiterIntent && canSend) {
      lastResumeSentRef.current = now
      return `${answer}\n\nResume: ${RESUME_URL}`
    }
    return answer
  }

  // “Why hire you?” smart answer (client-side shortcut)
  const isWhyHire = (text) => {
    const t = (text || '').toLowerCase()
    return (
      t.includes('why should we hire') ||
      t.includes('why hire') ||
      t.includes('why you') ||
      t.includes('why should i hire') ||
      t.includes('why should we choose') ||
      t.includes('what makes you the best') ||
      t.includes('why are you a good fit')
    )
  }

  const smartWhyHireAnswer = () => {
    return `You should hire Mann Mehta because he combines **hands-on automation** with **full-stack and mobile development**—and he can ship practical solutions fast.

**What he brings**
- **Automation strength (real work):** Built a virtual-printer-to-PDF pipeline, microservice automation workflows, API transaction download automation, and email/attachment automation at Llamachant Technologies.
- **Full-stack delivery:** React + Spring Boot experience through InstiManage (capstone) with bookings, dashboards, RBAC, and REST APIs.
- **Mobile development:** iOS (Swift + MapKit + SQLite, MVC) with CampusConnect and Android (Kotlin + Jetpack Compose, MVVM + Room) with Smart Campus Assistant.
- **Reliable execution:** Strong academics (3.70 GPA at Sheridan) and clear communication (Sheridan role with 98% compliance).

**Best fit if you need**
- Someone who can build features end-to-end (UI → API → DB)
- Someone strong at automation and workflow tooling
- Someone comfortable across web + mobile stacks

Resume: ${RESUME_URL}`
  }

  const callAIProxy = async ({ userMessage, recruiterIntent }) => {
    const conversationText = messages
      .slice(-10)
      .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
      .join('\n')

    const prompt = `
${systemContext}

Settings:
- Tone: ${tone}
- Language: ${language}
- Interview Mode: ${interviewOn ? 'ON' : 'OFF'}
- Interview Role: ${interviewRole}
- Recruiter Intent: ${recruiterIntent ? 'YES' : 'NO'}

Conversation:
${conversationText || 'None'}

User Question:
${userMessage}

Instruction:
Respond only as Mann Mehta’s portfolio assistant.
Be complete, confident, and use headings/bullets when helpful.
If recruiter intent is YES, include the resume link once if not recently shared.

Assistant:
`.trim()

    const res = await fetch('/.netlify/functions/gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        model: 'gemini-2.5-flash'
      })
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      throw new Error(txt || 'AI proxy error')
    }

    const j = await res.json()
    return j.output || j.text || "I couldn't generate a response."
  }

  const getFallbackResponse = (userInput) => {
    const lower = (userInput || '').toLowerCase()

    if (lower.includes('resume') || lower.includes('cv')) {
      return `You can download Mann’s resume here: ${RESUME_URL}`
    }

    if (isWhyHire(userInput)) {
      return smartWhyHireAnswer()
    }

    if (lower.includes('who') || lower.includes('about')) {
      return `Mann Mehta is a Full Stack Developer based in Brampton, ON with 1+ year of professional experience, focused on automation, React + Spring Boot, and mobile apps (iOS Swift/MapKit, Android Kotlin/Compose). Resume: ${RESUME_URL}`
    }

    if (lower.includes('skill') || lower.includes('stack') || lower.includes('tech')) {
      return `Skills: Java, JavaScript/TypeScript, Python, C#, React, Angular, Spring Boot, MySQL, MongoDB, Oracle SQL, SQLite, Git/GitHub, Docker, AWS, Swift/MapKit, Kotlin/Jetpack Compose, API + browser + email automation.`
    }

    if (lower.includes('project') || lower.includes('portfolio')) {
      return `Projects:
- InstiManage (React + Spring Boot): bookings, dashboards, RBAC, REST APIs
- CampusConnect (iOS Swift + MapKit): interactive campus map with SQLite
- Smart Campus Assistant (Android Kotlin + Compose): MVVM + Room
GitHub: https://github.com/mehmannj`
    }

    if (lower.includes('experience') || lower.includes('work') || lower.includes('job')) {
      return `Experience:
- Llamachant Technologies (Software Developer, 2025): virtual printer to PDF automation, microservice pipelines, API + email automation
- Samskrita Bharati (Full-Stack Intern, 2024): educational games with React/Angular/Bootstrap/MySQL
- Sheridan College (Jr. Enforcement Officer, 2023–present): 98% compliance validating permits/contracts`
    }

    if (lower.includes('contact') || lower.includes('email') || lower.includes('github') || lower.includes('linkedin')) {
      return `Contact Mann:
Email: mehtamann16@gmail.com
GitHub: https://github.com/mehmannj
LinkedIn: https://www.linkedin.com/in/mann-mehta-17b819252
Resume: ${RESUME_URL}`
    }

    return `I can share Mann’s skills, projects (InstiManage, CampusConnect, Smart Campus Assistant), automation work, experience, and contact info. Resume: ${RESUME_URL}`
  }

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage = input.trim()
    const recruiterIntent = detectRecruiterIntent(userMessage)

    // auto-switch tone to recruiter if recruiter intent is detected
    if (recruiterIntent && tone !== 'recruiter') setTone('recruiter')

    setMessages(prev => [...prev, { type: 'user', text: userMessage }])
    setInput('')
    setIsTyping(true)
    setError(null)

    try {
      // Smart local answer for "why hire you" (fast + consistent)
      if (isWhyHire(userMessage) && !interviewOn) {
        const ans = smartWhyHireAnswer()
        setMessages(prev => [...prev, { type: 'bot', text: ans }])
        return
      }

      let response = await callAIProxy({ userMessage, recruiterIntent })
      response = maybeAppendResume(response, recruiterIntent)
      setMessages(prev => [...prev, { type: 'bot', text: response }])
    } catch (err) {
      setError('AI is temporarily unavailable. Showing a basic answer.')
      const fallback = getFallbackResponse(userMessage)
      setMessages(prev => [...prev, { type: 'bot', text: fallback }])
    } finally {
      setIsTyping(false)
    }
  }

des('hey')) {
      return greetings[Math.floor(Math.random() * greetings.length)]
    }

    return `I can help you with information about Mann's skills, projects, experience, automation expertise, or contact details. You can download the resume here: ${RESUME_URL}`
  }

>>>>>>> parent of 5e16fce (solve contact issue and ai minor errors)
" },
    { icon: <FaRocket />, text: 'Why Hire', prompt: "Why should we hire Mann Mehta?" }
  ]

  const clearChat = () => {
    sessionStorage.removeItem('ai_memory_v2')
    setMessages([])
    setError(null)
    setIsTyping(false)
  }

  return (
    <>
      {/* SEO INDEXABLE SUMMARY (not display:none) */}
      <section className="ai-seo-summary" aria-label="Portfolio summary">
        <h2>Mann Mehta — Full Stack Developer</h2>
        <p>{seoSummaryText}</p>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      </section>

      <motion.button
        className="ai-assistant-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 180 : 0 }}
        aria-label="Open AI assistant"
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
            transition={{ type: 'spring', damping: 22 }}
          >
            <div className="ai-header">
              <div className="ai-title">
                <FaRobot />
                <span>AI Assistant</span>
              </div>

              <div className="ai-header-actions">
                <button className="ai-small-btn" onClick={clearChat} title="Clear chat">
                  Clear
                </button>
                <button className="ai-close" onClick={() => setIsOpen(false)} aria-label="Close">
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="ai-controls">
              <div className="ai-control-group">
                <span className="ai-control-label">Tone</span>
                <div className="ai-seg">
                  <button
                    className={tone === 'recruiter' ? 'active' : ''}
                    onClick={() => setTone('recruiter')}
                  >
                    Recruiter
                  </button>
                  <button
                    className={tone === 'casual' ? 'active' : ''}
                    onClick={() => setTone('casual')}
                  >
                    Casual
                  </button>
                </div>
              </div>

              <div className="ai-control-group">
                <span className="ai-control-label">Language</span>
                <select
                  className="ai-language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="auto">Auto</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div className="ai-control-group">
                <span className="ai-control-label">Interview</span>
                <div className="ai-interview-row">
                  <label className="ai-switch">
                    <input
                      type="checkbox"
                      checked={interviewOn}
                      onChange={(e) => setInterviewOn(e.target.checked)}
                    />
                    <span className="ai-slider" />
                  </label>
                  <select
                    className="ai-language-select"
                    value={interviewRole}
                    onChange={(e) => setInterviewRole(e.target.value)}
                    disabled={!interviewOn}
                    title="Interview role"
                  >
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Automation Engineer">Automation Engineer</option>
                    <option value="Mobile Developer">Mobile Developer</option>
                  </select>
                </div>
              </div>
            </div>

            {error && <div className="ai-error">{error}</div>}

            <div className="ai-messages">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  className={`ai-message ${msg.type}`}
                  initial={{ opacity: 0, x: msg.type === 'user' ? 18 : -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {msg.type === 'bot' && <FaRobot className="bot-icon" />}
                  <div className="message-content">
                    {String(msg.text || '')
                      .split('\n')
                      .filter(Boolean)
                      .map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div className="ai-message bot typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <FaRobot className="bot-icon" />
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="ai-quick-actions">
              {quickActions.map((qa, idx) => (
                <motion.button
                  key={idx}
                  className="quick-action-btn"
                  onClick={() => {
                    setInput(qa.prompt)
                    setTimeout(handleSend, 80)
                  }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {qa.icon}
                  <span>{qa.text}</span>
                </motion.button>
              ))}
            </div>

            <div className="ai-input-container">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={interviewOn ? "Answer the interview question..." : "Ask me anything about Mann..."}
                className="ai-input"
              />
              <motion.button
                className="ai-send"
                onClick={handleSend}
                disabled={isTyping}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                aria-label="Send"
              >
                <FaRocket />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIAssistant
