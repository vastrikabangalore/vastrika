import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { imageSrcSet, imageUrl } from '../lib/content'

export const EASE = [0.22, 1, 0.36, 1]
const VIEW = { once: true, margin: '0px 0px -12% 0px' }

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Vastrika` : 'Vastrika by Venkareshweri | Fashion Designer, Bangalore'
  }, [title])
}

export function Reveal({ children, delay = 0, y = 26, className, as = 'div', onLoad = false }) {
  const Tag = motion[as]
  const shown = { opacity: 1, y: 0 }
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      {...(onLoad ? { animate: shown } : { whileInView: shown, viewport: VIEW })}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </Tag>
  )
}

export function SplitText({ text, as = 'h2', className, delay = 0, onLoad = false, by = 'word' }) {
  const Tag = motion[as]
  const reduced = useReducedMotion()
  const parts = by === 'letter' ? [...text] : text.split(' ')
  const show = { y: '0%', rotate: 0 }
  const trigger = onLoad ? { animate: show } : { whileInView: show, viewport: VIEW }

  return (
    <Tag className={className} aria-label={text}>
      {parts.map((part, index) => (
        <Fragment key={`${part}-${index}`}>
          <span className="split" aria-hidden="true">
            <motion.span
              initial={reduced ? false : { y: '112%', rotate: by === 'letter' ? 4 : 2 }}
              {...trigger}
              transition={{ duration: 1, delay: delay + index * (by === 'letter' ? 0.05 : 0.06), ease: EASE }}
            >
              {part}
            </motion.span>
          </span>
          {by === 'word' && index < parts.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </Tag>
  )
}

function FadeImage({ url, alt, sizes, priority, className = '' }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <img
      ref={(element) => {
        if (element?.complete && element.naturalWidth) setLoaded(true)
      }}
      className={`${className} ${loaded ? 'is-loaded' : ''}`}
      src={imageUrl(url, 1000)}
      srcSet={imageSrcSet(url)}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
    />
  )
}

export function Picture({ url, hoverUrl, alt = '', label, sizes, priority = false, className = '', reveal = true }) {
  const reduced = useReducedMotion()
  const animate = reveal && !reduced
  return (
    <motion.div
      className={`picture ${className}`}
      initial={animate ? { clipPath: 'inset(100% 0% 0% 0%)' } : false}
      whileInView={animate ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
      viewport={VIEW}
      transition={{ duration: 1.25, ease: EASE }}
    >
      <motion.div
        className="picture-inner"
        initial={animate ? { scale: 1.2 } : false}
        whileInView={animate ? { scale: 1 } : undefined}
        viewport={VIEW}
        transition={{ duration: 1.6, ease: EASE }}
      >
        {url
          ? <FadeImage url={url} alt={alt} sizes={sizes} priority={priority} />
          : <div className="fabric"><span>{label}</span></div>}
        {hoverUrl && <FadeImage className="picture-hover" url={hoverUrl} alt="" sizes={sizes} />}
      </motion.div>
    </motion.div>
  )
}

export function Parallax({ children, distance = 50, className }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })
  const y = useTransform(smooth, [0, 1], [distance, -distance])
  return (
    <motion.div ref={ref} className={className} style={reduced ? undefined : { y }}>
      {children}
    </motion.div>
  )
}

export function Skeleton({ variant = 'grid' }) {
  if (variant === 'detail') {
    return (
      <div className="skeleton-detail" role="status" aria-label="Loading">
        <div className="shimmer tall" />
        <div><div className="shimmer line wide" /><div className="shimmer line" /><div className="shimmer line short" /></div>
      </div>
    )
  }
  return (
    <div className="skeleton-grid" role="status" aria-label="Loading">
      {[0, 1, 2].map((item) => <div className="shimmer tall" key={item} />)}
    </div>
  )
}

export function LoadError({ retry }) {
  return (
    <div className="status" role="alert">
      <p>This page could not load. Check your connection and try again.</p>
      <button className="btn" onClick={retry}><span>Try again</span></button>
    </div>
  )
}
