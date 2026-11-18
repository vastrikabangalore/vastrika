import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { imageUrl } from '../lib/content'
import { lockScroll } from '../lib/scroll'
import { EASE } from './Motion'

export default function Lightbox({ images, title, start, onClose }) {
  const [state, setState] = useState({ index: start, direction: 1 })
  const closeButton = useRef(null)
  const count = images.length
  const { index, direction } = state

  const go = useCallback((step) => {
    setState((current) => ({ index: (current.index + step + count) % count, direction: step }))
  }, [count])

  useEffect(() => {
    lockScroll(true)
    closeButton.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      lockScroll(false)
      window.removeEventListener('keydown', onKey)
    }
  }, [go, onClose])

  const image = images[index]

  return (
    <motion.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} images`}
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="lightbox-top">
        <span aria-live="polite">{index + 1} of {count}</span>
        <button ref={closeButton} onClick={onClose}>Close</button>
      </div>
      <div className="lightbox-stage">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={image.id}
            src={imageUrl(image.url, 1600)}
            alt={image.alt_text || `${title}, image ${index + 1}`}
            custom={direction}
            variants={{
              enter: (d) => ({ x: `${d * 45}%`, opacity: 0 }),
              center: { x: '0%', opacity: 1 },
              exit: (d) => ({ x: `${d * -45}%`, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.55, ease: EASE }}
            drag={count > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={(_event, info) => {
              if (info.offset.x < -70 || info.velocity.x < -450) go(1)
              else if (info.offset.x > 70 || info.velocity.x > 450) go(-1)
            }}
          />
        </AnimatePresence>
      </div>
      {count > 1 && (
        <div className="lightbox-nav">
          <button onClick={() => go(-1)}>Previous</button>
          <button onClick={() => go(1)}>Next</button>
        </div>
      )}
    </motion.div>
  )
}
