import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion' // eslint-disable-line no-unused-vars
import { Upload, Trash2, X, ChevronLeft, ChevronRight, ChevronUp, Palette, PenTool, Layout, Image, Mail, MapPin, Phone, Instagram, Twitter, Linkedin, Github, Star, CheckCircle } from 'lucide-react'
import profileImg from './assets/profile.png'
import './App.css'

const STORAGE_KEY = 'portfolio_works'

const loadWorks = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

const saveWorks = (works) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(works))
}

const categories = ['all', 'branding', 'illustration', 'ui/ux', 'print', 'photography']

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
}

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
}

const testimonials = [
  { name: 'Sarah Johnson', role: 'CEO, TechStart', text: 'Austine delivered exceptional branding work that perfectly captured our vision. His attention to detail and creative approach made the entire process seamless.', initials: 'SJ' },
  { name: 'Michael Chen', role: 'Marketing Director', text: 'Working with Austine was a game-changer for our brand. His designs are not only beautiful but strategically crafted to resonate with our audience.', initials: 'MC' },
  { name: 'Emily Williams', role: 'Startup Founder', text: 'Incredible talent and professionalism. Austine transformed our ideas into stunning visuals that exceeded all expectations. Highly recommended!', initials: 'EW' },
]

const skillBars = [
  { name: 'Adobe Photoshop', percent: 95 },
  { name: 'Illustrator', percent: 90 },
  { name: 'Figma', percent: 88 },
  { name: 'UI/UX Design', percent: 85 },
  { name: 'Branding', percent: 92 },
]

function useCountUp(end, duration = 2000, shouldStart = false) {
  const [count, setCount] = useState(0)
  const countRef = useRef(null)

  useEffect(() => {
    if (!shouldStart) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        countRef.current = requestAnimationFrame(step)
      }
    }
    countRef.current = requestAnimationFrame(step)
    return () => { if (countRef.current) cancelAnimationFrame(countRef.current) }
  }, [end, duration, shouldStart])

  return count
}

function App() {
  const [works, setWorks] = useState(loadWorks)
  const [filter, setFilter] = useState('all')
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [uploadData, setUploadData] = useState({ title: '', category: 'branding', preview: null, file: null })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [toasts, setToasts] = useState([])
  const [testimonialIdx, setTestimonialIdx] = useState(0)
  const [statsVisible, setStatsVisible] = useState(false)
  const [skillsVisible, setSkillsVisible] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const statsRef = useRef(null)
  const skillsRef = useRef(null)

  const projectCount = useCountUp(50, 2000, statsVisible)
  const clientCount = useCountUp(30, 2000, statsVisible)
  const yearCount = useCountUp(5, 1500, statsVisible)

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      setShowBackToTop(window.scrollY > 400)
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { saveWorks(works) }, [works])

  // Intersection observer for stats count-up
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.5 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  // Intersection observer for skill bars
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setSkillsVisible(true) },
      { threshold: 0.3 }
    )
    if (skillsRef.current) observer.observe(skillsRef.current)
    return () => observer.disconnect()
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIdx(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const filteredWorks = filter === 'all' ? works : works.filter(w => w.category === filter)

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setUploadData(prev => ({ ...prev, preview: ev.target.result, file }))
      setShowUploadModal(true)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setUploadData(prev => ({ ...prev, preview: ev.target.result, file }))
      setShowUploadModal(true)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleUpload = useCallback(() => {
    if (!uploadData.preview || !uploadData.title) return
    const newWork = {
      id: Date.now(),
      title: uploadData.title,
      category: uploadData.category,
      image: uploadData.preview,
      date: new Date().toLocaleDateString()
    }
    setWorks(prev => [newWork, ...prev])
    setUploadData({ title: '', category: 'branding', preview: null, file: null })
    setShowUploadModal(false)
    addToast(`"${newWork.title}" added to portfolio!`, 'success')
  }, [uploadData, addToast])

  const handleDelete = useCallback((id) => {
    const work = works.find(w => w.id === id)
    setWorks(prev => prev.filter(w => w.id !== id))
    setDeleteConfirm(null)
    if (lightbox !== null) setLightbox(null)
    if (work) addToast(`"${work.title}" removed from portfolio`, 'error')
  }, [lightbox, works, addToast])

  const navigateLightbox = useCallback((dir) => {
    setLightbox(prev => {
      const newIdx = prev + dir
      if (newIdx < 0 || newIdx >= filteredWorks.length) return prev
      return newIdx
    })
  }, [filteredWorks.length])

  const scrollToSection = (id) => {
    setMobileMenu(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <>
      {/* SCROLL PROGRESS */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* PARTICLES */}
      <div className="particles-container">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="particle" />)}
      </div>

      {/* TOASTS */}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div key={toast.id} className={`toast ${toast.type}`}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: 'spring', damping: 15 }}>
              <span className="toast-icon">{toast.type === 'success' ? <CheckCircle size={18} color="#2ecc71" /> : <Trash2 size={18} color="#e63946" />}</span>
              <span className="toast-message">{toast.message}</span>
              <button className="toast-close" onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}><X size={16} /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <a href="#" className="nav-logo">Austine<span>.</span></a>
        <ul className={`nav-links ${mobileMenu ? 'open' : ''}`}>
          {['home', 'about', 'services', 'portfolio', 'testimonials', 'contact'].map(item => (
            <li key={item}>
              <a href={`#${item}`} onClick={(e) => { e.preventDefault(); scrollToSection(item) }}>{item}</a>
            </li>
          ))}
        </ul>
        <button className="hamburger" onClick={() => setMobileMenu(!mobileMenu)}>
          <span /><span /><span />
        </button>
      </nav>

      {/* HERO */}
      <section className="hero-section" id="home">
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <motion.p className="hero-greeting" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              Hello, I&apos;m
            </motion.p>
            <motion.h1 className="hero-name" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              Austine
            </motion.h1>
            <motion.p className="hero-title" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              A <span className="typing-wrapper"><span className="typing-text">Graphic Designer</span></span>
            </motion.p>
            <motion.p className="hero-description" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              I create stunning visual experiences that captivate audiences and bring brands to life through innovative design solutions.
            </motion.p>
            <motion.div className="hero-buttons" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
              <button className="btn-primary" onClick={() => scrollToSection('portfolio')}>View My Work</button>
              <button className="btn-outline" onClick={() => scrollToSection('contact')}>Contact Me</button>
            </motion.div>
            <motion.div className="hero-stats" ref={statsRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
              <div className="hero-stat">
                <div className="hero-stat-number">{projectCount}+</div>
                <div className="hero-stat-label">Projects</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">{clientCount}+</div>
                <div className="hero-stat-label">Clients</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">{yearCount}+</div>
                <div className="hero-stat-label">Years Exp</div>
              </div>
            </motion.div>
          </div>
          <div className="hero-image-wrapper">
            <motion.div className="hero-image-container"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', damping: 15 }}>
              <div className="hero-image-ring" />
              <div className="hero-image-ring-2" />
              <div className="hero-image-ring-3" />
              <img src={profileImg} alt="Austine" className="hero-image" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="section" id="about">
        <motion.div className="section-header" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <p className="section-subtitle">About Me</p>
          <h2 className="section-title">Know Me More</h2>
          <div className="section-line" />
        </motion.div>
        <div className="about-content">
          <motion.div className="about-image-container" variants={fadeInLeft} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <img src={profileImg} alt="Austine" className="about-image" />
            <div className="about-image-accent" />
          </motion.div>
          <motion.div className="about-text" variants={fadeInRight} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h3>Creative Graphic Designer</h3>
            <p>
              I am a passionate graphic designer with a keen eye for detail and a love for creating
              visually compelling designs. With years of experience in the industry, I specialize in
              brand identity, illustration, UI/UX design, and print media.
            </p>
            <p>
              My approach combines creativity with strategic thinking to deliver designs that not only
              look great but also effectively communicate your brand&apos;s message. Every project is
              an opportunity to push creative boundaries.
            </p>
            <div className="about-skills">
              {['Adobe Photoshop', 'Illustrator', 'Figma', 'InDesign', 'After Effects', 'Branding', 'Typography', 'UI/UX Design'].map(skill => (
                <motion.span key={skill} className="skill-tag" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>{skill}</motion.span>
              ))}
            </div>
            <div className="skill-bars" ref={skillsRef}>
              {skillBars.map(skill => (
                <div key={skill.name} className="skill-bar-item">
                  <div className="skill-bar-header">
                    <span className="skill-bar-name">{skill.name}</span>
                    <span className="skill-bar-percent">{skillsVisible ? skill.percent : 0}%</span>
                  </div>
                  <div className="skill-bar-track">
                    <div className="skill-bar-fill" style={{ width: skillsVisible ? `${skill.percent}%` : '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section" id="services">
        <motion.div className="section-header" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <p className="section-subtitle">What I Do</p>
          <h2 className="section-title">My Services</h2>
          <div className="section-line" />
        </motion.div>
        <motion.div className="services-grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {[
            { icon: <Palette size={28} />, title: 'Brand Identity', desc: 'Creating memorable brand identities that resonate with your target audience and stand out in the market.' },
            { icon: <PenTool size={28} />, title: 'Illustration', desc: 'Custom illustrations that bring your ideas to life with unique artistic style and creative expression.' },
            { icon: <Layout size={28} />, title: 'UI/UX Design', desc: 'Intuitive and beautiful user interfaces designed to enhance user experience and drive engagement.' },
            { icon: <Image size={28} />, title: 'Print Design', desc: 'High-quality print materials including brochures, posters, business cards, and packaging design.' },
            { icon: <PenTool size={28} />, title: 'Typography', desc: 'Custom typography and lettering that adds personality and distinction to your brand communications.' },
            { icon: <Palette size={28} />, title: 'Motion Graphics', desc: 'Engaging motion graphics and animations that capture attention and tell your brand story dynamically.' },
          ].map((service, i) => (
            <motion.div key={i} className="service-card" variants={scaleIn}
              whileHover={{ y: -10, rotateX: 2 }}>
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* PORTFOLIO */}
      <section className="section" id="portfolio">
        <motion.div className="section-header" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <p className="section-subtitle">My Work</p>
          <h2 className="section-title">Portfolio</h2>
          <div className="section-line" />
        </motion.div>

        <motion.div className="portfolio-controls" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {categories.map(cat => (
            <motion.button key={cat} className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)} variants={fadeInUp} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              {cat}
            </motion.button>
          ))}
        </motion.div>

        <motion.div className="portfolio-grid" layout>
          <AnimatePresence>
            {filteredWorks.map((work, idx) => (
              <motion.div
                key={work.id}
                className="portfolio-item"
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.4, type: 'spring', damping: 20 }}
                onClick={() => setLightbox(idx)}
              >
                <img src={work.image} alt={work.title} />
                <div className="portfolio-overlay">
                  <h3>{work.title}</h3>
                  <p>{work.category}</p>
                </div>
                <button
                  className="portfolio-delete-btn"
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(work.id) }}
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredWorks.length === 0 && (
          <motion.p style={{ textAlign: 'center', color: 'var(--gray)', marginTop: '2rem' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {works.length === 0 ? 'No works yet. Upload your first design!' : 'No works in this category.'}
          </motion.p>
        )}

        <motion.div className={`upload-area ${dragOver ? 'drag-over' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}>
          <Upload size={48} className="upload-icon" />
          <h3>Upload New Work</h3>
          <p>{dragOver ? 'Drop your file here!' : 'Click or drag and drop your design files here'}</p>
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} />
        </motion.div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section" id="testimonials">
        <motion.div className="section-header" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <p className="section-subtitle">What Clients Say</p>
          <h2 className="section-title">Testimonials</h2>
          <div className="section-line" />
        </motion.div>
        <div className="testimonials-wrapper">
          <button className="testimonial-nav prev" onClick={() => setTestimonialIdx(prev => (prev - 1 + testimonials.length) % testimonials.length)}>
            <ChevronLeft size={20} />
          </button>
          <div className="testimonials-track" style={{ transform: `translateX(-${testimonialIdx * 100}%)` }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} className="testimonial-card" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div className="testimonial-author-info">
                    <h4>{t.name}</h4>
                    <p>{t.role}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', marginTop: '1rem' }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="#e63946" color="#e63946" />)}
                </div>
              </motion.div>
            ))}
          </div>
          <button className="testimonial-nav next" onClick={() => setTestimonialIdx(prev => (prev + 1) % testimonials.length)}>
            <ChevronRight size={20} />
          </button>
          <div className="testimonial-dots">
            {testimonials.map((_, i) => (
              <button key={i} className={`testimonial-dot ${i === testimonialIdx ? 'active' : ''}`} onClick={() => setTestimonialIdx(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div className="upload-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowUploadModal(false)}>
            <motion.div className="upload-modal"
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 15 }}
              onClick={e => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setShowUploadModal(false)}><X size={24} /></button>
              <h2>Upload Work</h2>
              {uploadData.preview && (
                <motion.img src={uploadData.preview} alt="Preview" className="upload-preview"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} />
              )}
              <div className="form-group">
                <label>Title</label>
                <input type="text" placeholder="Enter work title" value={uploadData.title}
                  onChange={e => setUploadData(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={uploadData.category} onChange={e => setUploadData(prev => ({ ...prev, category: e.target.value }))}>
                  {categories.filter(c => c !== 'all').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="upload-modal-actions">
                <motion.button className="btn-primary" onClick={handleUpload} style={{ flex: 1 }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Upload</motion.button>
                <motion.button className="btn-outline" onClick={() => setShowUploadModal(false)} style={{ flex: 1 }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Cancel</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightbox !== null && filteredWorks[lightbox] && (
          <motion.div className="lightbox-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}>
            <motion.div className="lightbox-content"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              onClick={e => e.stopPropagation()}>
              <button className="lightbox-close" onClick={() => setLightbox(null)}><X size={28} /></button>
              {lightbox > 0 && (
                <button className="lightbox-nav lightbox-prev" onClick={() => navigateLightbox(-1)}><ChevronLeft size={24} /></button>
              )}
              <img src={filteredWorks[lightbox].image} alt={filteredWorks[lightbox].title} />
              <div className="lightbox-info">
                <h3>{filteredWorks[lightbox].title}</h3>
                <p>{filteredWorks[lightbox].category} | {filteredWorks[lightbox].date}</p>
              </div>
              {lightbox < filteredWorks.length - 1 && (
                <button className="lightbox-nav lightbox-next" onClick={() => navigateLightbox(1)}><ChevronRight size={24} /></button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {deleteConfirm !== null && (
          <motion.div className="delete-confirm-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}>
            <motion.div className="delete-confirm-modal"
              initial={{ scale: 0.5, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 5 }}
              transition={{ type: 'spring', damping: 15 }}
              onClick={e => e.stopPropagation()}>
              <h3>Delete Work?</h3>
              <p>Are you sure you want to remove this work from your portfolio? This action cannot be undone.</p>
              <div className="delete-confirm-actions">
                <motion.button className="btn-primary" onClick={() => handleDelete(deleteConfirm)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Delete</motion.button>
                <motion.button className="btn-outline" onClick={() => setDeleteConfirm(null)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Cancel</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTACT */}
      <section className="section" id="contact">
        <motion.div className="section-header" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <p className="section-subtitle">Get In Touch</p>
          <h2 className="section-title">Contact Me</h2>
          <div className="section-line" />
        </motion.div>
        <div className="contact-content">
          <motion.div className="contact-info" variants={fadeInLeft} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h3>Let&apos;s work together</h3>
            <p>Have a project in mind? I would love to hear about it. Let&apos;s discuss how we can bring your vision to life.</p>
            <div className="contact-item">
              <div className="contact-item-icon"><Mail size={22} /></div>
              <div className="contact-item-text">
                <h4>Email</h4>
                <p>austine@designer.com</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon"><Phone size={22} /></div>
              <div className="contact-item-text">
                <h4>Phone</h4>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon"><MapPin size={22} /></div>
              <div className="contact-item-text">
                <h4>Location</h4>
                <p>Creative City, Design World</p>
              </div>
            </div>
          </motion.div>
          <motion.form className="contact-form" variants={fadeInRight} initial="hidden" whileInView="visible" viewport={{ once: true }}
            onSubmit={e => { e.preventDefault(); addToast('Message sent! I will get back to you soon.', 'success') }}>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <input type="text" placeholder="Subject" />
            <textarea placeholder="Your Message" required />
            <motion.button className="btn-primary" type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Send Message</motion.button>
          </motion.form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-socials">
            {[Instagram, Twitter, Linkedin, Github].map((Icon, i) => (
              <motion.a key={i} href="#" className="footer-social-link" whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.4 }}>
                <Icon size={20} />
              </motion.a>
            ))}
          </div>
          <p>&copy; {new Date().getFullYear()} <span>Austine</span>. All rights reserved.</p>
        </div>
      </footer>

      {/* BACK TO TOP */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button className="back-to-top" onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}>
            <ChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}

export default App
