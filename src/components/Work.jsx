import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMediaQuery } from '../lib/scroll'
import { EASE, Parallax, Picture, Reveal, SplitText } from './Motion'

function Look({ design, index, parallax }) {
  const wide = useMediaQuery('(min-width: 900px)')
  const cover = design.images[0]
  const card = (
    <Link to={`/designs/${design.slug}`} className="look-link" data-cursor="View">
      <Picture
        url={cover?.url}
        hoverUrl={design.images[1]?.url}
        alt={cover?.alt_text || design.title}
        label={design.title}
        priority={index < 2}
        sizes="(max-width: 900px) 50vw, 40vw"
      />
      <span className="look-title">{design.title}</span>
      {(design.category || design.collection) && (
        <span className="look-meta">{design.category?.name ?? design.collection?.name}</span>
      )}
    </Link>
  )
  if (!parallax || !wide) return card
  return <Parallax distance={[0, 46, 24, 64, 34][index % 5]}>{card}</Parallax>
}

export function WorkGrid({ designs, parallax = false }) {
  return (
    <motion.div className="lookbook" layout={!parallax} transition={{ duration: 0.7, ease: EASE }}>
      <AnimatePresence mode="popLayout" initial={false}>
        {designs.map((design, index) => (
          <motion.div
            key={design.id}
            className="look"
            layout={!parallax}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <Look design={design} index={index} parallax={parallax} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

function RailCard({ collection, index }) {
  return (
    <Link to={`/collections/${collection.slug}`} className="rail-card" data-cursor="Open">
      <Picture
        className="arch"
        url={collection.cover_image_url}
        alt={collection.name}
        label={collection.name}
        priority={index < 2}
        reveal={false}
        sizes="(max-width: 900px) 78vw, 34vw"
      />
      <h3>{collection.name}</h3>
      {collection.season && <p>{collection.season}</p>}
    </Link>
  )
}

export function CollectionsRail({ collections }) {
  const wide = useMediaQuery('(min-width: 900px)')
  const section = useRef(null)
  const track = useRef(null)
  const [distance, setDistance] = useState(0)
  const [progressText, setProgressText] = useState(1)
  const swipe = useMotionValue(0)
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.35 })
  const x = useTransform(smooth, [0, 1], [0, -distance])
  const bar = useTransform(wide ? smooth : swipe, [0, 1], [0.08, 1])

  useEffect(() => {
    if (!wide || !track.current) return undefined
    const measure = () => setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth))
    const observer = new ResizeObserver(measure)
    observer.observe(track.current)
    measure()
    return () => observer.disconnect()
  }, [wide, collections.length])

  const onSwipe = (event) => {
    const element = event.currentTarget
    const max = element.scrollWidth - element.clientWidth
    const value = max > 0 ? element.scrollLeft / max : 0
    swipe.set(value)
    setProgressText(Math.min(collections.length, Math.round(value * (collections.length - 1)) + 1))
  }

  return (
    <section
      ref={section}
      className="rail-section"
      style={wide ? { height: `calc(100vh + ${distance}px)` } : undefined}
    >
      <div className="rail-sticky">
        <div className="rail-head">
          <SplitText text="Collections" />
          <Link to="/collections">View all</Link>
        </div>
        <motion.div
          ref={track}
          className="rail"
          style={wide ? { x } : undefined}
          onScroll={wide ? undefined : onSwipe}
          tabIndex={wide ? undefined : 0}
          aria-label="Collections"
        >
          {collections.map((collection, index) => (
            <RailCard key={collection.id} collection={collection} index={index} />
          ))}
        </motion.div>
        <div className="rail-foot">
          <div className="rail-bar"><motion.i style={{ scaleX: bar }} /></div>
          {!wide && <span>{progressText} of {collections.length}</span>}
        </div>
      </div>
    </section>
  )
}

export function CollectionStack({ collections }) {
  return (
    <div className="collection-stack">
      {collections.map((collection, index) => (
        <Link key={collection.id} to={`/collections/${collection.slug}`} className="stack-row" data-cursor="Open">
          <Parallax distance={26}>
            <Picture
              className="arch"
              url={collection.cover_image_url}
              alt={collection.name}
              label={collection.name}
              priority={index === 0}
              sizes="(max-width: 900px) 100vw, 46vw"
            />
          </Parallax>
          <div>
            <SplitText as="h2" text={collection.name} />
            <Reveal>
              {collection.season && <p className="muted">{collection.season}</p>}
              {collection.description && <p>{collection.description}</p>}
            </Reveal>
          </div>
        </Link>
      ))}
    </div>
  )
}
