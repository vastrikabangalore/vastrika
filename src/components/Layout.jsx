import { AnimatePresence, motion, MotionConfig, useMotionValueEvent, useScroll, useSpring } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigationType, useOutlet } from 'react-router-dom'
import { site } from '../data'
import { INTRO_SECONDS, lockScroll, playsIntro, scrollToTarget, startSmoothScroll } from '../lib/scroll'
import Cursor from './Cursor'
import { EASE } from './Motion'

const links = [
  { to: '/designs', label: 'Designs' },
  { to: '/collections', label: 'Collections' },
  { to: '/journal', label: 'Journal' },
  { to: '/#about', label: 'About' },
  { to: '/#contact', label: 'Contact' },
]

function FrozenPage() {
  const outlet = useOutlet()
  const [page] = useState(outlet)
  return page
}

function Intro() {
  const [visible, setVisible] = useState(playsIntro)
  useEffect(() => {
    if (!visible) return undefined
    const timer = setTimeout(() => setVisible(false), INTRO_SECONDS * 1000 - 500)
    return () => clearTimeout(timer)
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="intro"
          aria-hidden="true"
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="intro-word">
            {[...site.name].map((letter, index) => (
              <span className="split" key={index}>
                <motion.span
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.75, delay: 0.08 + index * 0.05, ease: EASE }}
                >
                  {letter}
                </motion.span>
              </span>
            ))}
          </div>
          <motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.2, ease: EASE }} />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.65 }}>
            by {site.designer}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Menu({ onClose }) {
  const closeButton = useRef(null)

  useEffect(() => {
    lockScroll(true)
    closeButton.current?.focus()
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      lockScroll(false)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <motion.div
      className="menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      data-lenis-prevent
      initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div className="menu-top">
        <Link to="/" className="logo" onClick={onClose}>{site.name}</Link>
        <button ref={closeButton} className="menu-btn" onClick={onClose}>Close</button>
      </div>
      <nav aria-label="Menu links">
        {links.map((link, index) => (
          <span className="split" key={link.to}>
            <motion.span
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.8, delay: 0.16 + index * 0.06, ease: EASE }}
            >
              <Link to={link.to} onClick={onClose}>{link.label}</Link>
            </motion.span>
          </span>
        ))}
      </nav>
      <motion.div className="menu-foot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
        <a href={`mailto:${site.email}`}>{site.email}</a>
        <span>{site.location}</span>
      </motion.div>
    </motion.div>
  )
}

function Header() {
  const { pathname } = useLocation()
  const { scrollY } = useScroll()
  const [state, setState] = useState({ hidden: false, solid: false })
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const measure = useCallback((y, previous = y) => {
    const next = { hidden: y > previous && y > 140, solid: y > 24 }
    setState((current) => (
      current.hidden === next.hidden && current.solid === next.solid ? current : next
    ))
  }, [])

  useMotionValueEvent(scrollY, 'change', (y) => measure(y, scrollY.getPrevious()))

  useEffect(() => {
    const frame = requestAnimationFrame(() => measure(window.scrollY))
    const timer = setTimeout(() => measure(window.scrollY), 900)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [pathname, measure])

  const classes = state.solid ? 'header solid' : 'header'

  return (
    <>
      <motion.header
        className={classes}
        animate={{ y: state.hidden && !menuOpen ? '-100%' : '0%' }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <Link to="/" className="logo">{site.name}</Link>
        <nav className="nav" aria-label="Main">
          {links.map((link) => <NavLink key={link.to} to={link.to}><span>{link.label}</span></NavLink>)}
        </nav>
        <button className="menu-btn" aria-haspopup="dialog" onClick={() => setMenuOpen(true)}>Menu</button>
      </motion.header>
      <AnimatePresence>{menuOpen && <Menu onClose={closeMenu} />}</AnimatePresence>
    </>
  )
}

function Progress() {
  const { scrollYProgress } = useScroll()
  const scaleY = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })
  return (
    <div className="selvedge" aria-hidden="true">
      <motion.i style={{ scaleY }} />
    </div>
  )
}

export default function Layout() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const positions = useRef(new Map())
  const previous = useRef(location)
  const firstPage = useRef(true)

  useEffect(() => startSmoothScroll(), [])

  useEffect(() => {
    firstPage.current = false
    const before = previous.current
    previous.current = location
    if (before.key !== location.key) positions.current.set(before.key, window.scrollY)
    if (location.hash && before.pathname === location.pathname) {
      const target = document.getElementById(location.hash.slice(1))
      if (target) scrollToTarget(target)
    }
  }, [location])

  useEffect(() => {
    if (!location.hash) return undefined
    const timer = setTimeout(() => {
      const target = document.getElementById(location.hash.slice(1))
      if (target) scrollToTarget(target, { immediate: true })
    }, 700)
    return () => clearTimeout(timer)
    // Only for pages opened directly at a section.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const placeNewPage = () => {
    const saved = navigationType === 'POP' ? positions.current.get(location.key) : null
    const place = () => {
      const target = location.hash && document.getElementById(location.hash.slice(1))
      scrollToTarget(target || saved || 0, { immediate: true })
    }
    place()
    if (saved || location.hash) setTimeout(place, 450)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="page">
        <a className="skip" href="#content">Skip to content</a>
        <Intro />
        <Progress />
        <Cursor />
        <Header />
        <AnimatePresence mode="wait" onExitComplete={placeNewPage}>
          <motion.div key={location.pathname} className="route">
            <motion.div
              className="curtain curtain-in"
              aria-hidden="true"
              initial={{ scaleY: firstPage.current ? 0 : 1 }}
              animate={{ scaleY: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            />
            <motion.div
              className="curtain curtain-out"
              aria-hidden="true"
              initial={{ scaleY: 0 }}
              exit={{ scaleY: 1 }}
              transition={{ duration: 0.42, ease: [0.76, 0, 0.24, 1] }}
            />
            <main id="content">
              <FrozenPage />
            </main>
            <Footer />
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <nav aria-label="Footer">
          {links.map((link) => <Link key={link.to} to={link.to}>{link.label}</Link>)}
        </nav>
        <div>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <p>{site.location}</p>
        </div>
        <button className="to-top" onClick={() => scrollToTarget(0)}>Back to top</button>
      </div>
      <div className="footer-word" aria-hidden="true">{site.name}</div>
      <p className="footer-small">© {new Date().getFullYear()} {site.name} by {site.designer}</p>
    </footer>
  )
}
