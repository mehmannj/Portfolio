import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ParticleBackground from './components/ParticleBackground'
import InteractiveBackground from './components/InteractiveBackground'
import CodeRain from './components/CodeRain'
import AIAssistant from './components/AIAssistant'
import InteractiveGame from './components/InteractiveGame'
import TypingChallenge from './components/TypingChallenge'
import EasterEgg from './components/EasterEgg'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('light-mode')
    } else {
      document.body.classList.add('light-mode')
    }
  }, [darkMode])

  return (
    <div className="App">
      <ParticleBackground />
      <InteractiveBackground />
      <CodeRain />
      <EasterEgg />
      <AIAssistant />
      <InteractiveGame />
      <TypingChallenge />
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Hero />
      <About />
      <Experience />
      <Skills />
      <Projects />
      <Contact />
      <Footer />
    </div>
  )
}

export default App

