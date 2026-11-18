import { createClient } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import { sample } from '../data'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const supabase = url && key
  ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  : null

const DESIGN_FIELDS = `
  id, title, slug, description, fabric, colors, tags, design_year, is_featured, sort_order, created_at,
  category:categories(name, slug),
  collection:collections(name, slug),
  images:design_images(id, url, alt_text, is_cover, sort_order)
`

function unwrap({ data, error }) {
  if (error) throw error
  return data
}

function orderImages(design) {
  const images = [...(design.images ?? [])].sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order,
  )
  return { ...design, images }
}

export async function getDesigns() {
  if (!supabase) return sample.designs
  const rows = unwrap(
    await supabase
      .from('designs')
      .select(DESIGN_FIELDS)
      .order('sort_order')
      .order('created_at', { ascending: false }),
  )
  return rows.map(orderImages)
}

export async function getDesign(slug) {
  if (!supabase) return sample.designs.find((d) => d.slug === slug) ?? null
  const row = unwrap(
    await supabase.from('designs').select(DESIGN_FIELDS).eq('slug', slug).maybeSingle(),
  )
  return row && orderImages(row)
}

export async function getCategories() {
  if (!supabase) return sample.categories
  return unwrap(await supabase.from('categories').select('id, name, slug').order('sort_order').order('name'))
}

export async function getCollections() {
  if (!supabase) return sample.collections
  return unwrap(
    await supabase
      .from('collections')
      .select('id, name, slug, season, description, cover_image_url')
      .order('sort_order')
      .order('created_at', { ascending: false }),
  )
}

export async function getCollection(slug) {
  if (!supabase) return sample.collections.find((c) => c.slug === slug) ?? null
  return unwrap(
    await supabase
      .from('collections')
      .select('id, name, slug, season, description, cover_image_url')
      .eq('slug', slug)
      .maybeSingle(),
  )
}

export async function getPosts() {
  if (!supabase) return sample.posts
  return unwrap(
    await supabase
      .from('posts')
      .select('id, title, slug, excerpt, cover_image_url, published_at, created_at')
      .order('published_at', { ascending: false, nullsFirst: false }),
  )
}

export async function getPost(slug) {
  if (!supabase) return null
  return unwrap(await supabase.from('posts').select('*').eq('slug', slug).maybeSingle())
}

export function useContent(load) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    load().then(
      (data) => active && setState({ data, error: null, loading: false }),
      (error) => active && setState({ data: null, error, loading: false }),
    )
    return () => {
      active = false
    }
  }, [load, attempt])

  const retry = useCallback(() => {
    setState({ data: null, error: null, loading: true })
    setAttempt((n) => n + 1)
  }, [])

  return { ...state, retry }
}

export function imageUrl(url, width) {
  if (!url) return ''
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`)
}

export function imageSrcSet(url) {
  if (!url?.includes('res.cloudinary.com')) return undefined
  return [640, 1000, 1600].map((w) => `${imageUrl(url, w)} ${w}w`).join(', ')
}

export function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
}
