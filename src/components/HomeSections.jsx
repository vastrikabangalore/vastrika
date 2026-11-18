import {
  AnimatePresence, motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring,
  useTransform, useVelocity,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { crafts, services, site, statement } from '../data'
import { imageSrcSet, imageUrl } from '../lib/content'
import { heroDelay, useMediaQuery } from '../lib/scroll'
import { EASE, Reveal, SplitText } from './Motion'

export function Hero({ designs }) {
  const ref = useRef(null)
  const mobile = useMediaQuery('(max-width: 899px)')
  const reduced = useReducedMotion()
  const [delay] = useState(heroDelay)
  const slides = designs.filter((design) => design.images[0]).slice(0, 4)
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.25 })

  const from = mobile
    ? 'inset(20% 13% 21% 13% round 50vw 50vw 0vw 0vw)'
    : 'inset(15% 34% 13% 34% round 20vw 20vw 0vw 0vw)'
  const clipPath = useTransform(progress, [0, 0.72], [from, 'inset(0% 0% 0% 0% round 0vw 0vw 0vw 0vw)'])
  const imageScale = useTransform(progress, [0, 0.8], [1.18, 1])
  const wordY = useTransform(progress, [0, 0.55], ['0%', '-42%'])
  const wordOpacity = useTransform(progress, [0.22, 0.56], [1, 0])
  const introOpacity = useTransform(progress, [0, 0.18], [1, 0])
  const shade = useTransform(progress, [0.35, 0.8], [0, 0.42])
  const endOpacity = useTransform(progress, [0.68, 0.86], [0, 1])
  const endY = useTransform(progress, [0.68, 0.86], [28, 0])

  useEffect(() => {
    if (slides.length < 2 || reduced) return undefined
    const timer = setInterval(() => setActive((current) => current + 1), 5200)
    return () => clearInterval(timer)
  }, [slides.length, reduced])

  const current = slides.length ? slides[active % slides.length] : null
  const image = current?.images[0]

  return (
    <section ref={ref} className="hero" id="hero" data-tone="dark">
      <div className="hero-sticky">
        <motion.div
          className="hero-window"
          style={reduced ? undefined : { clipPath }}
          initial={{ opacity: 0, scale: 0.94, y: 34 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.4, delay, ease: EASE }}
        >
          <motion.div className="hero-scale" style={reduced ? undefined : { scale: imageScale }}>
            <AnimatePresence initial={false}>
              {image ? (
                <motion.img
                  key={image.id}
                  src={imageUrl(image.url, 1600)}
                  srcSet={imageSrcSet(image.url)}
                  sizes="100vw"
                  alt={image.alt_text || current.title}
                  initial={{ opacity: 0, scale: 1.09 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ opacity: { duration: 1.4 }, scale: { duration: 6.5, ease: 'linear' } }}
                />
              ) : <div className="fabric" />}
            </AnimatePresence>
          </motion.div>
          <motion.div className="hero-shade" style={{ opacity: shade }} />
        </motion.div>

        <motion.div className="hero-word" style={reduced ? undefined : { y: wordY, opacity: wordOpacity }}>
          <SplitText as="h1" text={site.name} by="letter" onLoad delay={delay + 0.1} />
        </motion.div>

        <motion.div
          className="hero-intro"
          style={reduced ? undefined : { opacity: introOpacity }}
        >
          <Reveal onLoad delay={delay + 0.55} y={14}><p className="hero-by">by {site.designer}</p></Reveal>
          <Reveal onLoad delay={delay + 0.68} y={14} className="hero-right">
            <p>Contemporary Indian couture from Bangalore, rooted in handloom.</p>
            <span className="scroll-cue">Scroll <i /></span>
          </Reveal>
        </motion.div>

        <motion.div className="hero-end" style={reduced ? { opacity: 0 } : { opacity: endOpacity, y: endY }}>
          <p>Every piece begins with the cloth.</p>
          <Link to="/designs" className="btn light"><span>View designs</span></Link>
        </motion.div>
      </div>
    </section>
  )
}

function wrap(value) {
  return ((value % 50) - 50) % 50
}

export function Marquee() {
  const reduced = useReducedMotion()
  const base = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 300 })
  const boost = useTransform(velocity, [-1800, 0, 1800], [-4, 0, 4], { clamp: false })
  const skew = useTransform(velocity, [-2200, 2200], [5, -5])
  const x = useTransform(base, (value) => `${wrap(value)}%`)
  const direction = useRef(-1)

  useAnimationFrame((_time, delta) => {
    if (reduced) return
    if (boost.get() < 0) direction.current = 1
    else if (boost.get() > 0) direction.current = -1
    base.set(base.get() + direction.current * (delta / 1000) * (1.1 + Math.abs(boost.get()) * 1.2))
  })

  const row = [...crafts, ...crafts, ...crafts, ...crafts]
  return (
    <div className="marquee">
      <p className="sr-only">{crafts.join(', ')}</p>
      <motion.div className="marquee-track" aria-hidden="true" style={{ x, skewX: skew }}>
        {row.map((craft, index) => <span key={index}>{craft}<i /></span>)}
      </motion.div>
    </div>
  )
}

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  return <motion.span style={{ opacity }}>{children} </motion.span>
}

export function Statement() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 82%', 'end 52%'] })
  const words = statement.split(' ')
  return (
    <section className="statement" id="about">
      <p ref={ref} aria-label={statement}>
        <span aria-hidden="true">
          {words.map((word, index) => (
            <Word key={index} progress={scrollYProgress} range={[index / words.length, (index + 1.5) / words.length]}>
              {word}
            </Word>
          ))}
        </span>
      </p>
      <Reveal className="statement-note">
        <p>
          The studio works closely with weavers and artisans across India on couture, bridal
          and ready-to-wear collections.
        </p>
      </Reveal>
    </section>
  )
}

export function Services() {
  const [open, setOpen] = useState(0)
  return (
    <section className="services" id="services">
      <SplitText text="Work with the studio" />
      <div className="service-list">
        {services.map((service, index) => {
          const expanded = open === index
          return (
            <Reveal key={service.title} delay={index * 0.06} className="service">
              <button
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? -1 : index)}
                onPointerEnter={(event) => event.pointerType === 'mouse' && setOpen(index)}
              >
                <span>{service.title}</span>
                <i className={expanded ? 'open' : ''} aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    className="service-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <p>{service.desc}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

function MagneticLink({ href, children }) {
  const x = useSpring(0, { stiffness: 180, damping: 15, mass: 0.2 })
  const y = useSpring(0, { stiffness: 180, damping: 15, mass: 0.2 })
  return (
    <motion.a
      className="magnetic"
      href={href}
      style={{ x, y }}
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse') return
        const box = event.currentTarget.getBoundingClientRect()
        x.set((event.clientX - box.left - box.width / 2) * 0.22)
        y.set((event.clientY - box.top - box.height / 2) * 0.35)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.a>
  )
}

export function Contact() {
  return (
    <section className="contact" id="contact" data-tone="dark">
      <SplitText text="Tell us what you would like made." />
      <Reveal className="contact-row">
        <p>For commissions, collaborations and studio appointments with {site.designer}.</p>
        <MagneticLink href={`mailto:${site.email}`}>{site.email}</MagneticLink>
      </Reveal>
    </section>
  )
}
