import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaTimes, FaCode, FaLightbulb, FaRocket } from 'react-icons/fa'
// Note: Gemini calls are performed server-side via a Netlify Function proxy.
// This prevents bundling the Gemini SDK and exposing API keys in the browser.
import './AIAssistant.css'

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)

  const systemContext = `You are an AI assistant for Mann Mehta's portfolio website. Mann is a Full Stack Developer with 1+ year of professional experience and 5 years of education and training.

COMPREHENSIVE INFORMATION ABOUT MANN MEHTA:

PERSONAL & CONTACT:
- Full Name: Mann Mehta
- Email: mehtamann16@gmail.com
- Location: Brampton, ON, Canada
- GitHub: https://github.com/mehmannj
- LinkedIn: https://www.linkedin.com/in/mann-mehta-17b819252
- Status: Open to Work / Available for opportunities

PROFESSIONAL EXPERIENCE:
1. Software Developer at Llamachant Technologies Ltd (05/2025 - 06/2025, Remote)
   - Developed virtual printer system to capture print jobs, convert to PDFs, and store automatically
   - Built automation pipelines using microservices to streamline workflows
   - Created Source Browser Automation and API-based transaction download tools
   - Automated email retrieval and attachment processing
   - Conducted research on emerging technologies

2. Full-Stack Developer Intern at Samskrita Bharati (01/2024 - 12/2024, Remote)
   - Collaborated with remote team to develop interactive educational mini games
   - Used Bootstrap, Angular, React.js, JavaScript, CSS, HTML, MySQL
   - Enhanced engagement through gamification and responsive designs
   - Managed version control with Git/GitHub, resolved merge conflicts

3. Jr. Enforcement Officer at Sheridan College (04/2023 - Present, Brampton, ON)
   - Enhanced user engagement through gamification and responsive design
   - Achieved 98% compliance rate in validating project permits and contracts
   - Communicated regularly with designers and stakeholders

EDUCATION:
1. Computer Systems Technology at Sheridan College (01/2023 - 12/2025, Brampton, ON)
   - Software Development and Network Engineering
   - GPA: 3.70/4.0
   - Currently pursuing

2. Diploma in Information Technology with Distinction at L.J. Polytechnic (06/2019 - 06/2022, Ahmedabad, Gujarat, India)
   - GPA: 3.84/4.0
   - Graduated with Distinction

TECHNICAL SKILLS:
Programming Languages: Java, C#, Python, JavaScript, TypeScript, C, HTML, PHP
Frameworks & Libraries: React, AngularJS, jQuery, Bootstrap, Spring Boot, JavaFX
Databases: MySQL, Oracle SQL, MongoDB, SQLite
Tools & Technologies: Git, Docker, Eclipse, NetBeans, Visual Studio, Android Studio
Protocols: FTP, HTTP, SMTP, DHCP, NAT, DNS, SNMP
Cloud & Platforms: AWS, Windows, Linux/Unix, macOS
Design: Figma

PROJECTS WITH LINKS:
1. InstiManage - Smart Campus Management Platform (Capstone Project)
   - GitHub: https://github.com/mehmannj/instimanage-capstone
   - Full-stack application with React + Vite frontend and Spring Boot backend
   - Booking workflows, admin dashboards, role-based access control
   - RESTful APIs, SQLite storage
   - Served as Scrum Master

2. CampusConnect - iOS Campus Map Application
   - GitHub: https://github.com/mehmannj/CampusConnect
   - MapKit for interactive maps, SQLite for persistence
   - UIKit with MVC design principles

3. Smart Campus Assistant - Android Application
   - GitHub: https://github.com/mehmannj/SmartCampusAssistant
   - Jetpack Compose with MVVM architecture
   - Room Database for local storage

4. C# Automation Tool - Installer & Workflow Automation
   - Automation utilities using C# and .NET
   - Background monitoring, logging, workflow automation

5. SevenQWordGame - Educational Sanskrit vocabulary game
   - AngularJS, JavaScript, HTML, CSS, MySQL
   - Dual-language support (English and Sanskrit)

6. GraphicGame - Interactive graphical game
   - C# and Windows Forms
   - Object-oriented principles

SPECIALIZATIONS:
- Automation (virtual printers, browser automation, workflow automation)
- API Integration (RESTful APIs, microservices)
- Full-Stack Development (React, Spring Boot, Node.js)
- Mobile Development (iOS with Swift, Android with Kotlin)
- Database Design (MySQL, MongoDB, SQLite)
- Version Control (Git, GitHub, collaborative workflows)

ACHIEVEMENTS:
- 98% compliance rate in project validation
- Served as Scrum Master for capstone project
- Graduated with Distinction from L.J. Polytechnic
- Maintained high GPA (3.70/4.0 at Sheridan, 3.84/4.0 at L.J. Polytechnic)

TRAINING & CERTIFICATIONS:
- Ethical Hacker (CISCO Networking Academy)
- Introduction to Cyber Security (CISCO Networking Academy)

IMPORTANT INSTRUCTIONS:
- ALWAYS provide GitHub links when asked about projects or code repositories
- GitHub profile: https://github.com/mehmannj
- LinkedIn: https://www.linkedin.com/in/mann-mehta-17b819252
- DO NOT mention phone number in responses
- Be friendly, professional, and helpful
- Provide specific links when relevant
- Keep responses concise but informative
- When asked about "github", "git", "repositories", or "code", always include the GitHub link`

  const greetings = [
    "👋 Hey! I'm your AI assistant powered by Gemini. Ask me about Mann's skills, projects, or experience!",
    "🚀 Want to know about automation? API integration? Full-stack development? Just ask!",
    "💡 Curious about Mann's projects? I can tell you about InstiManage, CampusConnect, and more!",
    "⚡ Ask me anything about Mann's tech stack, experience, or achievements!"
  ]

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = greetings[Math.floor(Math.random() * greetings.length)]
      setMessages([{ type: 'bot', text: greeting }])
    }
  }, [isOpen])

  const GEMINI_MODEL = 'gemini-2.5-flash'

  // Always call the server-side proxy. The server determines whether a
  // server-side key is available and will return a helpful error if not.
  const callGeminiAPI = async (userMessage) => {
    try {
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
        throw new Error(text || 'Gemini proxy error')
      }

      const j = await res.json()
      return j.output || j.text || "I couldn't generate a response."
    } catch (error) {
      console.error('Gemini proxy error:', error)
      throw new Error(error.message || 'Failed to get response from Gemini API')
    }
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

      // Always attempt to use the server-side Gemini proxy. If the server
      // does not have a configured key, the proxy will return an error and
      // the fallback will be used instead.
      try {
        response = await callGeminiAPI(userMessage)
      } catch (proxyErr) {
        // Log and fall back to local canned responses
        console.warn('Proxy failed, using fallback:', proxyErr.message)
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
      return "You can reach Mann at:\n📧 Email: mehtamann16@gmail.com\n📍 Location: Brampton, ON\n🔗 GitHub: https://github.com/mehmannj\n🔗 LinkedIn: https://www.linkedin.com/in/mann-mehta-17b819252"
    } else if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return greetings[Math.floor(Math.random() * greetings.length)]
    }
    
    return "I can help you with information about Mann's skills, projects, experience, automation expertise, or contact details. Try asking about any of these topics!"
  }

  const quickActions = [
    { icon: <FaCode />, text: 'Skills', action: () => setInput('What are Mann\'s skills?') },
    { icon: <FaRocket />, text: 'Projects', action: () => setInput('Tell me about Mann\'s projects') },
    { icon: <FaLightbulb />, text: 'Experience', action: () => setInput('What is Mann\'s experience?') }
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
                <span>AI Assistant {hasKey ? '(Gemini)' : '(Basic)'}</span>
              </div>
              <button className="ai-close" onClick={() => setIsOpen(false)}>
                <FaTimes />
              </button>
            </div>

            {!hasKey && (
              <div className="ai-warning">
                ⚠️ Gemini API key not configured. Using basic responses. Add VITE_GEMINI_API_KEY to .env file.
              </div>
            )}

            {error && (
              <div className="ai-error">
                ⚠️ {error}
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
