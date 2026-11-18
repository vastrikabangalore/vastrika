import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ImageGallery } from '../components/Images'
import { LoadState, PageHead, SelectField, TextArea, TextField, Toggle, useFeedback } from '../components/ui'
import { deleteImages } from '../lib/cloudinary'
import { friendlyError, slugify, splitList, unwrap, useLeaveWarning, useLoad } from '../lib/helpers'
import { supabase } from '../lib/supabase'

const blank = {
  title: '', slug: '', description: '', category_id: '', collection_id: '', fabric: '',
  colors: '', tags: '', design_year: '', sort_order: '0', is_featured: false, is_published: false,
}

function toForm(design) {
  return {
    title: design.title,
    slug: design.slug,
    description: design.description ?? '',
    category_id: design.category_id ?? '',
    collection_id: design.collection_id ?? '',
    fabric: design.fabric ?? '',
    colors: design.colors.join(', '),
    tags: design.tags.join(', '),
    design_year: design.design_year?.toString() ?? '',
    sort_order: String(design.sort_order),
    is_featured: design.is_featured,
    is_published: design.is_published,
  }
}

export default function DesignEdit() {
  const { id } = useParams()
  return <Editor key={id ?? 'new'} id={id} />
}

function Editor({ id }) {
  const navigate = useNavigate()
  const { notify, confirm } = useFeedback()

  const load = useCallback(async () => {
    const [categories, collections, design] = await Promise.all([
      supabase.from('categories').select('id, name').order('name').then(unwrap),
      supabase.from('collections').select('id, name').order('name').then(unwrap),
      id
        ? supabase.from('designs').select('*, images:design_images(*)').eq('id', id).maybeSingle().then(unwrap)
        : null,
    ])
    return { categories, collections, design }
  }, [id])
  const { data, loading, error, reload } = useLoad(load)

  const [form, setForm] = useState(blank)
  const [images, setImages] = useState([])
  const [original, setOriginal] = useState({ form: blank, images: [] })
  const [slugTouched, setSlugTouched] = useState(Boolean(id))
  const [uploading, setUploading] = useState(0)
  const [saving, setSaving] = useState(false)
  const [problem, setProblem] = useState('')

  useEffect(() => {
    if (!data?.design) return
    const nextForm = toForm(data.design)
    const nextImages = [...data.design.images].sort((a, b) => a.sort_order - b.sort_order)
    setForm(nextForm)
    setImages(nextImages)
    setOriginal({ form: nextForm, images: nextImages })
  }, [data])

  useEffect(() => {
    document.title = `${id ? 'Edit design' : 'Add design'} | Vastrika Admin`
  }, [id])

  const dirty = useMemo(
    () => JSON.stringify([form, images]) !== JSON.stringify([original.form, original.images]),
    [form, images, original],
  )
  useLeaveWarning(dirty)

  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }))
  const setTitle = (title) => setForm((current) => ({
    ...current,
    title,
    slug: slugTouched ? current.slug : slugify(title),
  }))
  const trackUpload = useCallback((active) => setUploading((n) => n + (active ? 1 : -1)), [])

  const save = async (event) => {
    event.preventDefault()
    setProblem('')
    const slug = slugify(form.slug)
    const year = form.design_year.trim()
    if (!form.title.trim()) return setProblem('Add a title.')
    if (!slug) return setProblem('Add a web address using English letters or numbers.')
    if (year && !/^\d{4}$/.test(year)) return setProblem('Enter the year as four digits, like 2026.')

    setSaving(true)
    const payload = {
      title: form.title.trim(),
      slug,
      description: form.description.trim() || null,
      category_id: form.category_id || null,
      collection_id: form.collection_id || null,
      fabric: form.fabric.trim() || null,
      colors: splitList(form.colors),
      tags: splitList(form.tags),
      design_year: year ? Number(year) : null,
      sort_order: Number(form.sort_order) || 0,
      is_featured: form.is_featured,
      is_published: form.is_published,
    }

    try {
      const saved = id
        ? await supabase.from('designs').update(payload).eq('id', id).select('id').single().then(unwrap)
        : await supabase.from('designs').insert(payload).select('id').single().then(unwrap)

      if (images.length) {
        const rows = images.map((image, index) => ({
          id: image.id,
          design_id: saved.id,
          url: image.url,
          cloudinary_public_id: image.cloudinary_public_id,
          alt_text: image.alt_text?.trim() || null,
          is_cover: image.is_cover,
          sort_order: index,
        }))
        unwrap(await supabase.from('design_images').upsert(rows))
      }

      const kept = new Set(images.map((image) => image.id))
      const removed = original.images.filter((image) => !kept.has(image.id))
      if (removed.length) {
        unwrap(await supabase.from('design_images').delete().in('id', removed.map((image) => image.id)))
        deleteImages(removed.map((image) => image.cloudinary_public_id))
      }

      notify(form.is_published ? 'Design saved and published' : 'Design saved as draft')
      if (id) {
        setForm((current) => ({ ...current, slug }))
        reload()
      } else {
        setOriginal({ form, images })
        navigate(`/designs/${saved.id}`, { replace: true })
      }
    } catch (saveError) {
      setProblem(friendlyError(saveError))
    } finally {
      setSaving(false)
    }
    return undefined
  }

  const remove = async () => {
    const accepted = await confirm({
      title: `Delete ${form.title}?`,
      body: 'The design and its images will be removed from the site. This cannot be undone.',
      action: 'Delete design',
    })
    if (!accepted) return
    const { error: deleteError } = await supabase.from('designs').delete().eq('id', id)
    if (deleteError) {
      notify(friendlyError(deleteError), 'error')
      return
    }
    deleteImages(original.images.map((image) => image.cloudinary_public_id))
    setOriginal({ form, images })
    notify('Design deleted')
    navigate('/designs')
  }

  if (loading || error) return <LoadState loading={loading} error={error} retry={reload} />
  if (id && !data.design) {
    return (
      <div className="panel">
        <p>This design no longer exists.</p>
        <Link className="button" to="/designs">Back to designs</Link>
      </div>
    )
  }

  return (
    <form onSubmit={save} noValidate>
      <PageHead title={id ? form.title || 'Edit design' : 'Add design'}>
        <Link className="button" to="/designs">Back</Link>
        <button className="button primary" disabled={saving || uploading > 0}>
          {saving ? 'Saving…' : uploading > 0 ? 'Uploading…' : 'Save design'}
        </button>
      </PageHead>
      {problem && <p className="error banner" role="alert">{problem}</p>}

      <div className="edit-grid">
        <div className="stack">
          <section className="panel">
            <h2>Images</h2>
            <ImageGallery images={images} onChange={setImages} onUploadingChange={trackUpload} />
          </section>
          <section className="panel">
            <h2>Details</h2>
            <TextField label="Title" value={form.title} onChange={setTitle} required />
            <TextArea label="Description" value={form.description} onChange={set('description')} rows={6} />
            <div className="two">
              <TextField label="Fabric" value={form.fabric} onChange={set('fabric')} placeholder="Handwoven silk" />
              <TextField label="Year" value={form.design_year} onChange={set('design_year')} inputMode="numeric" maxLength={4} placeholder="2026" />
            </div>
            <TextField label="Colours" hint="Separate with commas" value={form.colors} onChange={set('colors')} placeholder="Indigo, gold" />
            <TextField label="Tags" hint="Separate with commas" value={form.tags} onChange={set('tags')} placeholder="Bridal, zari" />
          </section>
        </div>

        <div className="stack">
          <section className="panel">
            <h2>Visibility</h2>
            <Toggle
              label="Published"
              hint={form.is_published && !images.length ? 'Add an image so this looks complete on the site.' : 'Show on the portfolio'}
              checked={form.is_published}
              onChange={set('is_published')}
            />
            <Toggle label="Featured" hint="Show on the home page" checked={form.is_featured} onChange={set('is_featured')} />
          </section>
          <section className="panel">
            <h2>Organise</h2>
            <SelectField label="Category" empty="No category" value={form.category_id} onChange={set('category_id')} options={data.categories} />
            <SelectField label="Collection" empty="No collection" value={form.collection_id} onChange={set('collection_id')} options={data.collections} />
            <TextField label="Position" hint="Lower numbers appear first" type="number" value={form.sort_order} onChange={set('sort_order')} />
            <TextField
              label="Web address"
              hint={form.slug ? `/designs/${slugify(form.slug)}` : 'Created from the title'}
              value={form.slug}
              onChange={(value) => {
                setSlugTouched(true)
                set('slug')(value)
              }}
            />
          </section>
          {id && <button type="button" className="button danger" onClick={remove}>Delete design</button>}
        </div>
      </div>
    </form>
  )
}
