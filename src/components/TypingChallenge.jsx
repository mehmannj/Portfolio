import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaKeyboard, FaTimes, FaCheck } from 'react-icons/fa'
import './TypingChallenge.css'

const TypingChallenge = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [text, setText] = useState('')
  const [userInput, setUserInput] = useState('')
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [startTime, setStartTime] = useState(null)
  const [duration, setDuration] = useState(30) // seconds
  const [remaining, setRemaining] = useState(30)
  const [loadingParagraph, setLoadingParagraph] = useState(false)
  const intervalRef = useRef(null)
  const inputRef = useRef(null)

  const paragraphPool = [
    // Public-domain short excerpts (for demo/fallback)
    "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do.",
    "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
    "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
    "The sun did not shine. It was too wet to play. So we sat in the house. All that cold, cold, wet day.",
  ]

  const durations = [15, 30, 60]

  const fetchParagraph = async () => {
    setLoadingParagraph(true)
    try {
      const res = await fetch('https://api.quotable.io/random?minLength=120&maxLength=300')
      if (!res.ok) throw new Error('Network')
      const j = await res.json()
      if (j.content) setText(j.content)
      else throw new Error('No content')
    } catch (e) {
      // fallback to local pool
      const p = paragraphPool[Math.floor(Math.random() * paragraphPool.length)]
      setText(p)
    } finally {
      setLoadingParagraph(false)
    }
  }

  const resetChallenge = () => {
    setIsActive(false)
    setUserInput('')
    setWpm(0)
    setAccuracy(100)
    setStartTime(null)
    setRemaining(duration)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startChallenge = async ({ fetchNew = true } = {}) => {
    if (fetchNew) await fetchParagraph()
    setUserInput('')
    setWpm(0)
    setAccuracy(100)
    setIsActive(true)
    setStartTime(Date.now())
    setRemaining(duration)
    setTimeout(() => inputRef.current?.focus(), 120)
  }

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // start countdown
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
            setIsActive(false)
            return 0
          }
          return r - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive])

  useEffect(() => {
    if (startTime) {
      const timeElapsedMinutes = (Date.now() - startTime) / 1000 / 60
      const maxCompareLength = Math.min(userInput.length, text.length)
      let correctChars = 0
      for (let i = 0; i < maxCompareLength; i++) {
        if (userInput[i] === text[i]) correctChars++
      }

      const wordsTyped = correctChars / 5
      const currentWpm = timeElapsedMinutes > 0 ? Math.round(wordsTyped / timeElapsedMinutes) : 0
      setWpm(currentWpm || 0)

      const acc = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100
      setAccuracy(acc || 100)
    }
  }, [userInput, startTime, text])

  const getCharClass = (index) => {
    if (index >= userInput.length) return ''
    if (userInput[index] === text[index]) return 'correct'
    return 'incorrect'
  }

  return (
    <>
      <motion.button
        className="typing-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 180 : 0 }}
      >
        <FaKeyboard />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="typing-challenge"
            initial={{ opacity: 0, scale: 0.8, x: -100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -100 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="typing-header">
              <div className="typing-title">
                <FaKeyboard />
                <span>Code Typing Challenge</span>
              </div>
              <button className="typing-close" onClick={() => setIsOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="typing-stats">
              <div className="typing-stat">
                <span className="typing-stat-label">WPM</span>
                <span className="typing-stat-value">{wpm}</span>
              </div>
              <div className="typing-stat">
                <span className="typing-stat-label">Accuracy</span>
                <span className="typing-stat-value">{accuracy}%</span>
              </div>
            </div>

            <div className="typing-content">
              {!isActive && remaining === duration ? (
                <div className="typing-start">
                  <FaKeyboard className="keyboard-icon" />
                  <h3>Test Your Typing Speed!</h3>
                  <p>Pick a duration, fetch a paragraph (optional), then start.</p>

                  <div className="typing-controls">
                    <div className="duration-buttons">
                      {durations.map((d) => (
                        <button
                          key={d}
                          className={`duration-btn ${duration === d ? 'active' : ''}`}
                          onClick={() => {
                            setDuration(d)
                            setRemaining(d)
                          }}
                        >
                          {d}s
                        </button>
                      ))}
                    </div>

                    <div className="paragraph-actions">
                      <button
                        className="paragraph-btn"
                        onClick={() => fetchParagraph()}
                        disabled={loadingParagraph}
                      >
                        {loadingParagraph ? 'Loading...' : 'Fetch Paragraph'}
                      </button>
                      <button
                        className="typing-start-btn"
                        onClick={() => startChallenge({ fetchNew: false })}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Start (current)
                      </button>
                      <motion.button
                        className="typing-start-btn"
                        onClick={() => startChallenge({ fetchNew: true })}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Start (new)
                      </motion.button>
                    </div>

                    {text && (
                      <div className="typing-preview">
                        <strong>Preview:</strong>
                        <div className="typing-text preview">{text}</div>
                      </div>
                    )}
                  </div>
                </div>
              ) : isActive ? (
                <div className="typing-game">
                  <div className="timer-row">
                    <div className="time-left">Time: {remaining}s</div>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{ width: `${((duration - remaining) / duration) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="typing-text">
                    {text.split('').map((char, index) => (
                      <span
                        key={index}
                        className={`char ${getCharClass(index)} ${
                          index === userInput.length ? 'current' : ''
                        }`}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="typing-input"
                    disabled={!isActive}
                  />
                </div>
              ) : (
                <div className="typing-results">
                  <motion.div
                    className="typing-complete"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <FaCheck />
                    <div>
                      <div>Time's up!</div>
                      <div>WPM: {wpm}</div>
                      <div>Accuracy: {accuracy}%</div>
                    </div>
                  </motion.div>

                  <div className="result-actions">
                    <button className="paragraph-btn" onClick={() => resetChallenge()}>
                      Retry
                    </button>
                    <button
                      className="paragraph-btn"
                      onClick={() => {
                        setText('')
                        resetChallenge()
                      }}
                    >
                      Change Paragraph
                    </button>
                    <button
                      className="typing-start-btn"
                      onClick={() => startChallenge({ fetchNew: true })}
                    >
                      Start New
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default TypingChallenge

