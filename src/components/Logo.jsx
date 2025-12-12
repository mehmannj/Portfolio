import { motion } from 'framer-motion'
import './Logo.css'

const Logo = ({ className = '' }) => {
  return (
    <motion.div
      className={`logo-container ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        className="logo-brackets"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        &lt;
      </motion.div>
      <motion.div
        className="logo-letters"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
      >
        <motion.span
          className="logo-m1"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          M
        </motion.span>
        <motion.span
          className="logo-m2"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 2,
            delay: 0.5,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          M
        </motion.span>
      </motion.div>
      <motion.div
        className="logo-slash"
        initial={{ opacity: 0, rotate: -90 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ delay: 0.6 }}
      >
        /
      </motion.div>
      <motion.div
        className="logo-brackets"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        &gt;
      </motion.div>
      <motion.div
        className="logo-glow"
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
    </motion.div>
  )
}

export default Logo

