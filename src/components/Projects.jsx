import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa'
import './Projects.css'

const Projects = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const projects = [
    {
      title: 'InstiManage - Smart Campus Management Platform',
      description: 'Developed a full-stack smart campus management platform to manage institutional resources such as lockers and rooms. Built a full-stack application with React + Vite frontend and Spring Boot backend. Implemented booking workflows, admin dashboards, and role-based access control. Designed RESTful APIs and integrated persistent storage using SQLite. Served as Scrum Master, coordinating Agile sprints and team delivery.',
      tech: ['React', 'Vite', 'Spring Boot', 'SQLite', 'RESTful APIs', 'Agile'],
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      github: 'https://github.com/mehmannj/instimanage-capstone'
    },
    {
      title: 'CampusConnect - iOS Campus Map Application',
      description: 'Developed an iOS application for campus navigation with searchable locations and saved data. Implemented MapKit for interactive maps and pin-based search. Integrated SQLite for local persistence of saved locations. Built the UI using UIKit, following MVC design principles.',
      tech: ['Swift', 'UIKit', 'MapKit', 'SQLite', 'MVC'],
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
      github: 'https://github.com/mehmannj/CampusConnect'
    },
    {
      title: 'Smart Campus Assistant - Android Application',
      description: 'Built an Android application to assist users with campus navigation and data storage. Developed the app using Jetpack Compose with MVVM architecture. Implemented Room Database for persistent local storage. Applied lifecycle-aware state management and structured navigation.',
      tech: ['Kotlin', 'Jetpack Compose', 'MVVM', 'Room Database'],
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop',
      github: 'https://github.com/mehmannj/SmartCampusAssistant'
    },
    {
      title: 'C# Automation Tool - Installer & Workflow Automation',
      description: 'Developed automation tools to reduce manual setup and operational processing. Built automation utilities using C# and .NET. Implemented background monitoring, logging, and workflow automation. Automated installer handling and system setup tasks.',
      tech: ['C#', '.NET', 'Automation', 'Background Processing'],
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      github: null
    }
  ]

  return (
    <section id="projects" className="projects-section" ref={ref}>
      <div className="section-container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Featured Projects
        </motion.h2>

        <div className="projects-grid">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              className="project-card"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className="project-image">
                <img src={project.image} alt={project.title} />
                <div className="project-overlay">
                  <motion.a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaGithub />
                  </motion.a>
                </div>
              </div>
              <div className="project-content">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="project-tech">
                  {project.tech.map((tech) => (
                    <span key={tech} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects

