import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import './About.css'

const About = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" className="about-section" ref={ref}>
      <div className="section-container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          About Me
        </motion.h2>

        <div className="about-content">
          <motion.div
            className="about-text"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p>
              As a passionate Computer Systems Technologist, I'm on an exhilarating journey of transforming 
              complex technological challenges into elegant, user-centric solutions. Currently pursuing my 
              degree in Software Development and Network Engineering at Sheridan College, I've cultivated 
              a robust skill set that bridges theoretical knowledge with practical innovation.
            </p>
            <p>
              My professional narrative is defined by a relentless curiosity and an adaptive mindset. I thrive 
              in dynamic environments where technology meets creativity, consistently pushing boundaries to 
              deliver impactful digital experiences. From crafting responsive web applications to optimizing 
              system architectures, I approach each project with strategic thinking and meticulous attention 
              to detail.
            </p>
          </motion.div>

          <motion.div
            className="about-stats"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="stat-card">
              <div className="stat-number">2+</div>
              <div className="stat-label">Years Experience</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">5+</div>
              <div className="stat-label">Years Education</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Compliance Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">3.70</div>
              <div className="stat-label">GPA</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About

