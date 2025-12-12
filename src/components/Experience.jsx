import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { FaBriefcase, FaGraduationCap } from 'react-icons/fa'
import './Experience.css'

const Experience = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const experiences = [
    {
      type: 'work',
      title: 'Software Developer',
      company: 'Llamachant Technologies Ltd',
      location: 'Remote',
      period: '05/2025 - 06/2025',
      icon: <FaBriefcase />,
      points: [
        'Developed a virtual printer system to capture print jobs, convert them to PDFs, and store them automatically',
        'Built automation pipelines using microservices to streamline internal workflows',
        'Created Source Browser Automation and API-based transaction download tools to improve efficiency',
        'Automated email retrieval and attachment processing to centralize communication records',
        'Conducted research on emerging technologies and applied findings to enhance existing systems'
      ]
    },
    {
      type: 'work',
      title: 'Full-Stack Developer Intern',
      company: 'Samskrita Bharati',
      location: 'Remote',
      period: '01/2024 - 12/2024',
      icon: <FaBriefcase />,
      points: [
        'Collaborated with a remote team to develop interactive educational mini games using Bootstrap, Angular, React.js, JavaScript, CSS, HTML, and MySQL',
        'Enhanced engagement through gamification elements and responsive designs',
        'Used Git and GitHub to manage version control in a collaborative environment, resolving merge conflicts and improving team workflows',
        'Demonstrated strong collaboration, problem-solving, and communication skills while working in a cross-functional remote team'
      ]
    },
    {
      type: 'work',
      title: 'Jr. Enforcement Officer',
      company: 'Sheridan College',
      location: 'Brampton, ON',
      period: '04/2023 - Present',
      icon: <FaBriefcase />,
      points: [
        'Enhanced user engagement through gamification and responsive design, while communicating regularly with designers and stakeholders',
        'Achieved a 98% compliance rate in validating project permits and contracts'
      ]
    }
  ]

  const education = [
    {
      type: 'education',
      title: 'Computer Systems Technology',
      company: 'Sheridan College',
      location: 'Brampton, ON',
      period: '01/2023 - 12/2025',
      icon: <FaGraduationCap />,
      points: [
        'Software Development and Network Engineering',
        'GPA: 3.70/4.0'
      ]
    },
    {
      type: 'education',
      title: 'Diploma in Information Technology with Distinction',
      company: 'L.J. Polytechnic',
      location: 'Ahmedabad, Gujarat, India',
      period: '06/2019 - 06/2022',
      icon: <FaGraduationCap />,
      points: [
        'Graduated with Distinction',
        'GPA: 3.84/4.0'
      ]
    }
  ]

  return (
    <section id="experience" className="experience-section" ref={ref}>
      <div className="section-container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Experience & Education
        </motion.h2>

        <div className="timeline">
          {experiences.map((exp, index) => (
            <motion.div
              key={`exp-${index}`}
              className="timeline-item"
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="timeline-icon">{exp.icon}</div>
              <div className="timeline-content">
                <h3>{exp.title}</h3>
                <h4>{exp.company}</h4>
                <span className="timeline-period">{exp.period} • {exp.location}</span>
                <ul>
                  {exp.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}

          {education.map((edu, index) => (
            <motion.div
              key={`edu-${index}`}
              className="timeline-item education"
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: (experiences.length + index) * 0.2 }}
            >
              <div className="timeline-icon">{edu.icon}</div>
              <div className="timeline-content">
                <h3>{edu.title}</h3>
                <h4>{edu.company}</h4>
                <span className="timeline-period">{edu.period} • {edu.location}</span>
                <ul>
                  {edu.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Experience

