import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaTimes, FaCode, FaLightbulb, FaRocket } from 'react-icons/fa'
import './AIAssistant.css'

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)

  // Public resume link
  const RESUME_URL = `${import.meta.env.BASE_URL || '/'}MannMehtaResume.pdf`

  const systemContext = `You are an AI assistant for Mann Mehta's portfolio website.
Resume link: ${RESUME_URL}
Mann Mehta - Full Stack Developer with 1+ year of professional experience.
Contact: mehtamann16@gmail.com
GitHub: https://github.com/mehmannj
LinkedIn: https://www.linkedin.com/in/mann-mehta-17b819252
When asked about projects or code, always include the GitHub link. Do not disclose phone numbers. Provide concise, professional answers.`

  const greetings = [
    "Hi there! I am Mann's AI assistant. How can I help?",
    "Hello! Want to hear about Mann's projects or skills?",
    "Hey! Ask me anything about Mann or grab the resume if you need it.",
    "Welcome! I can share Mann's experience, skills, and resume."
  ]

  const GEMINI_MODEL = 'gemini-2.5-flash'
  const hasKey = !!import.meta.env.VITE_GEMINI_API_KEY || !!import.meta.env.VITE_OPENAI_API_KEY

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = greetings[Math.floor(Math.random() * greetings.length)]
      setMessages([{ type: 'bot', text: greeting }])
    }
  }, [isOpen])

  const callAIProxy = async (userMessage) => {
    const conversationText = messages
      .slice(-6)
      .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
      .join('\n\n')

    const prompt = `${systemContext}\n\n${conversationText ? `${conversationText}\n\n` : ''}User: ${userMessage}\n\nAssistant:`

    const res = await fetch('/.netlify/functions/gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model: GEMINI_MODEL })
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'AI proxy error')
    }

    const j = await res.json()
    return j.output || j.text || "I couldn't generate a response."
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    const userMessageObj = { type: 'user', text: userMessage }

    setMessages(prev => [...prev, userMessageObj])
    setInput('')
    setIsTyping(true)
    setError(null)

    try {
      let response
      try {
        response = await callAIProxy(userMessage)
      } catch (proxyErr) {
        console.warn('AI proxy failed, using fallback:', proxyErr.message)
        response = getFallbackResponse(userMessage)
      }

      setIsTyping(false)
      setMessages(prev => [...prev, { type: 'bot', text: response }])
    } catch (err) {
      setIsTyping(false)
      setError(err.message)
      const fallbackResponse = getFallbackResponse(userMessage)
      setMessages(prev => [...prev, { type: 'bot', text: fallbackResponse }])
    }
  }

  const getFallbackResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes('skill')) {
      return "Mann is skilled in: Java, JavaScript, TypeScript, Python, C#, React, Angular, Spring Boot, MySQL, MongoDB, Git, Docker, AWS, and more! He's a full-stack developer with expertise in both frontend and backend technologies."
    } else if (lowerInput.includes('project')) {
      return "Mann has built several impressive projects:\n1. InstiManage - Smart Campus Management Platform (React + Spring Boot)\n2. CampusConnect - iOS Campus Map App\n3. Smart Campus Assistant - Android App\n4. C# Automation Tools\n5. Educational games and more!"
    } else if (lowerInput.includes('experience') || lowerInput.includes('work')) {
      return "Mann has 1+ year of professional experience:\n- Software Developer at Llamachant Technologies\n- Full-Stack Developer Intern at Samskrita Bharati\n- Jr. Enforcement Officer at Sheridan College\nHe's also pursuing Computer Systems Technology with a 3.70 GPA!"
    } else if (lowerInput.includes('automation') || lowerInput.includes('automate')) {
      return "Mann specializes in automation! He's built:\n- Virtual printer systems\n- Automation pipelines using microservices\n- Browser automation tools\n- Email processing automation\n- Workflow automation systems"
    } else if (lowerInput.includes('contact') || lowerInput.includes('email') || lowerInput.includes('github') || lowerInput.includes('linkedin')) {
      return "You can reach Mann at:\n- Email: mehtamann16@gmail.com\n- Location: Brampton, ON\n- GitHub: https://github.com/mehmannj\n- LinkedIn: https://www.linkedin.com/in/mann-mehta-17b819252"
    } else if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return greetings[Math.floor(Math.random() * greetings.length)]
    }

    return `I can help you with information about Mann's skills, projects, experience, automation expertise, or contact details. You can download the resume here: ${RESUME_URL}`
  }

  const quickActions = [
    { icon: <FaCode />, text: 'Skills', action: () => setInput("What are Mann's skills?") },
    { icon: <FaRocket />, text: 'Projects', action: () => setInput("Tell me about Mann's projects") },
    { icon: <FaLightbulb />, text: 'Experience', action: () => setInput("What is Mann's experience?") }
  ]

  return (
    <>
      <motion.button
        className="ai-assistant-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 180 : 0 }}
      >
        <FaRobot />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-assistant"
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="ai-header">
              <div className="ai-title">
                <FaRobot />
                <span>AI Assistant {hasKey ? '(Live)' : '(Basic)'}</span>
              </div>
              <button className="ai-close" onClick={() => setIsOpen(false)}>
                <FaTimes />
              </button>
            </div>

            {!hasKey && (
              <div className="ai-warning">
                No AI key detected. Using basic responses. Add GEMINI_API_KEY or OPENAI_API_KEY on the server (or VITE_GEMINI_API_KEY / VITE_OPENAI_API_KEY for local dev).
              </div>
            )}

            {error && (
              <div className="ai-error">
                {error}
              </div>
            )}

            <div className="ai-messages">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  className={`ai-message ${msg.type}`}
                  initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  {msg.type === 'bot' && <FaRobot className="bot-icon" />}
                  <div className="message-content">
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  className="ai-message bot typing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <FaRobot className="bot-icon" />
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="ai-quick-actions">
              {quickActions.map((action, idx) => (
                <motion.button
                  key={idx}
                  className="quick-action-btn"
                  onClick={() => {
                    action.action()
                    setTimeout(handleSend, 100)
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {action.icon}
                  <span>{action.text}</span>
                </motion.button>
              ))}
            </div>

            <div className="ai-input-container">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about Mann..."
                className="ai-input"
              />
              <motion.button
                className="ai-send"
                onClick={handleSend}
                disabled={isTyping}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
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
