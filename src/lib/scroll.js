import Lenis from 'lenis'
import { useEffect, useState } from 'react'

let lenis = null

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function startSmoothScroll() {
  if (prefersReducedMotion()) return undefined
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95 })
  let frame
  const tick = (time) => {
    lenis?.raf(time)
    frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
  return () => {
    cancelAnimationFrame(frame)
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToTarget(target, { immediate = false } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { immediate, force: true, duration: 1.3 })
    return
  }
  const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top, behavior: 'auto' })
}

export function lockScroll(locked) {
  document.documentElement.classList.toggle('is-locked', locked)
  if (locked) lenis?.stop()
  else lenis?.start()
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])
  return matches
}

function readIntroState() {
  try {
    if (sessionStorage.getItem('vastrika-intro')) return false
    sessionStorage.setItem('vastrika-intro', '1')
  } catch {
    return false
  }
  const home = window.location.pathname.replace(/\/$/, '') === import.meta.env.BASE_URL.replace(/\/$/, '')
  return home && !prefersReducedMotion()
}

export const INTRO_SECONDS = 1.9
export const playsIntro = readIntroState()
export const heroDelay = () => (playsIntro && performance.now() < 3500 ? INTRO_SECONDS - 0.35 : 0.15)
