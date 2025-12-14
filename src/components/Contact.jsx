import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import emailjs from 'emailjs-com'
import { FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import './Contact.css'

const Contact = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  // Read EmailJS config from environment. Set these in your Netlify/GitHub Actions env or in .env.local
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE || 'service_ypjbvke'
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE || 'template_fw3r6ip'
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'IQujbyKGZzEAZUJko'

  // Initialize EmailJS
  if (typeof emailjs.init === 'function' && PUBLIC_KEY) {
    try {
      emailjs.init(PUBLIC_KEY)
    } catch (e) {
      // ignore init errors during SSR or if already initialized
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // send using configured service/template/public key
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        to_name: 'Mann Mehta',
        // If your EmailJS template is configured to use a fixed recipient, they will receive this message.
        // Alternatively, you can configure the template to accept `to_email` and set it here to `mannmehta003@gmail.com`.
        reply_to: formData.email
      })

      setSubmitStatus('success')
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      console.error('EmailJS error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitStatus(null), 5000)
    }
  }

  return (
    <section id="contact" className="contact-section" ref={ref}>
      <div className="section-container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Get In Touch
        </motion.h2>

        <div className="contact-content">
          <motion.div
            className="contact-info"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3>Let's Connect</h3>
            <p>
              I'm always open to discussing new projects, creative ideas, or opportunities 
              to be part of your visions. Feel free to reach out!
            </p>

            <div className="contact-details">
              <div className="contact-item">
                <div className="contact-icon">
                  <FaEnvelope />
                </div>
                <div>
                  <h4>Email</h4>
                  <a href="mailto:mannmehta003@gmail.com">mannmehta003@gmail.com</a>
                </div>
              </div>


              <div className="contact-item">
                <div className="contact-icon">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h4>Location</h4>
                  <span>Brampton, ON</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.form
            className="contact-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="form-group">
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder=" "
              />
              <label htmlFor="name">Your Name</label>
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder=" "
              />
              <label htmlFor="email">Your Email</label>
            </div>

            <div className="form-group">
              <textarea
                name="message"
                id="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                placeholder=" "
              />
              <label htmlFor="message">Your Message</label>
            </div>

            <motion.button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </motion.button>

            {submitStatus === 'success' && (
              <motion.div
                className="form-message success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Thank you! Your message has been sent successfully.
              </motion.div>
            )}

            {submitStatus === 'error' && (
              <motion.div
                className="form-message error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Oops! Something went wrong. Please try again later.
              </motion.div>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  )
}

export default Contact

