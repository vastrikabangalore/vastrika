import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { useMediaQuery } from '../lib/scroll'

export default function Cursor() {
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reduced = useReducedMotion()
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springX = useSpring(x, { stiffness: 420, damping: 36, mass: 0.35 })
  const springY = useSpring(y, { stiffness: 420, damping: 36, mass: 0.35 })
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (!finePointer || reduced) return undefined
    const move = (event) => {
      x.set(event.clientX)
      y.set(event.clientY)
      setLabel(event.target.closest?.('[data-cursor]')?.dataset.cursor ?? '')
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [finePointer, reduced, x, y])

  if (!finePointer || reduced) return null

  return (
    <motion.div className="cursor" aria-hidden="true" style={{ x: springX, y: springY }}>
      <motion.span
        animate={{ scale: label ? 1 : 0, opacity: label ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {label}
      </motion.span>
    </motion.div>
  )
}
