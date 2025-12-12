import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaGamepad, FaTimes, FaTrophy } from 'react-icons/fa'
import './InteractiveGame.css'

const InteractiveGame = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isPlaying, setIsPlaying] = useState(false)
  const [targets, setTargets] = useState([])
  const gameAreaRef = useRef(null)

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setIsPlaying(false)
    }
  }, [isPlaying, timeLeft])

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        if (targets.length < 5) {
          const newTarget = {
            id: Date.now(),
            x: Math.random() * 80 + 10,
            y: Math.random() * 60 + 20,
          }
          setTargets((prev) => [...prev, newTarget])
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isPlaying, targets.length])

  const startGame = () => {
    setScore(0)
    setTimeLeft(30)
    setTargets([])
    setIsPlaying(true)
  }

  const hitTarget = (id) => {
    setTargets((prev) => prev.filter((t) => t.id !== id))
    setScore((prev) => prev + 10)
  }

  return (
    <>
      <motion.button
        className="game-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 180 : 0 }}
      >
        <FaGamepad />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="interactive-game"
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="game-header">
              <div className="game-title">
                <FaGamepad />
                <span>Skill Clicker</span>
              </div>
              <button className="game-close" onClick={() => setIsOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="game-stats">
              <div className="stat">
                <span className="stat-label">Score</span>
                <span className="stat-value">{score}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Time</span>
                <span className="stat-value">{timeLeft}s</span>
              </div>
            </div>

            <div className="game-area" ref={gameAreaRef}>
              {!isPlaying ? (
                <div className="game-start">
                  <FaTrophy className="trophy-icon" />
                  <h3>Click targets to score!</h3>
                  <p>Test your reflexes</p>
                  <motion.button
                    className="start-btn"
                    onClick={startGame}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Game
                  </motion.button>
                  {score > 0 && (
                    <motion.div
                      className="final-score"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Final Score: {score}
                    </motion.div>
                  )}
                </div>
              ) : (
                <>
                  {targets.map((target) => (
                    <motion.div
                      key={target.id}
                      className="game-target"
                      style={{
                        left: `${target.x}%`,
                        top: `${target.y}%`,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1.2 }}
                      onClick={() => hitTarget(target.id)}
                    />
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default InteractiveGame

