import { useCallback, useEffect, useState } from 'react'

export function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function friendlyError(error) {
  const message = error?.message ?? ''
  if (error?.code === '23505') return 'That web address is already in use. Change it and save again.'
  if (error?.code === '42501') return 'This account does not have permission to make that change.'
  if (/failed to fetch|network|load failed/i.test(message)) {
    return 'Could not reach the server. Check your connection. If it continues, check that the Supabase project is not paused.'
  }
  return message || 'Something went wrong. Try again.'
}

export function unwrap({ data, error }) {
  if (error) throw error
  return data
}

export function useLoad(load) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    load().then(
      (data) => active && setState({ data, error: null, loading: false }),
      (error) => active && setState({ data: null, error, loading: false }),
    )
    return () => {
      active = false
    }
  }, [load, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  return { ...state, reload }
}

export function useLeaveWarning(active) {
  useEffect(() => {
    if (!active) return undefined
    const warn = (event) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [active])
}

export function thumb(url, width = 240) {
  if (!url) return ''
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`)
}

export function coverOf(images = []) {
  return images.find((image) => image.is_cover)
    ?? [...images].sort((a, b) => a.sort_order - b.sort_order)[0]
}

export function splitList(text) {
  return text.split(',').map((item) => item.trim()).filter(Boolean)
}
