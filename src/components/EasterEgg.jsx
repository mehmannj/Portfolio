import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './EasterEgg.css'

const EasterEgg = () => {
  const [sequence, setSequence] = useState([])
  const [showMessage, setShowMessage] = useState(false)
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

  useEffect(() => {
    const handleKeyPress = (e) => {
      setSequence(prev => {
        const newSequence = [...prev, e.key].slice(-konamiCode.length)
        
        if (newSequence.length === konamiCode.length) {
          const isMatch = newSequence.every((key, index) => key === konamiCode[index])
          if (isMatch) {
            setShowMessage(true)
            setTimeout(() => setShowMessage(false), 5000)
            return []
          }
        }
        
        return newSequence
      })
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <AnimatePresence>
      {showMessage && (
        <motion.div
          className="easter-egg"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          <div className="easter-egg-content">
            <h2>🎮 Easter Egg Found!</h2>
            <p>You've unlocked the Konami Code!</p>
            <p className="easter-egg-subtitle">Mann loves building interactive experiences!</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EasterEgg

