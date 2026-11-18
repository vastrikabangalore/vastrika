import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CoverField } from '../components/Images'
import { LoadState, PageHead, TextArea, TextField, Toggle, useFeedback } from '../components/ui'
import { deleteImages, publicIdFromUrl } from '../lib/cloudinary'
import { friendlyError, slugify, unwrap, useLeaveWarning, useLoad } from '../lib/helpers'
import { supabase } from '../lib/supabase'

const blank = {
  name: '', slug: '', season: '', description: '', cover_image_url: '', sort_order: '0', is_published: false,
}

export default function CollectionEdit() {
  const { id } = useParams()
  return <Editor key={id ?? 'new'} id={id} />
}

function Editor({ id }) {
  const navigate = useNavigate()
  const { notify, confirm } = useFeedback()
  const load = useCallback(
    async () => (id ? supabase.from('collections').select('*').eq('id', id).maybeSingle().then(unwrap) : null),
    [id],
  )
  const { data, loading, error, reload } = useLoad(load)
  const [form, setForm] = useState(blank)
  const [original, setOriginal] = useState(blank)
  const [slugTouched, setSlugTouched] = useState(Boolean(id))
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [problem, setProblem] = useState('')

  useEffect(() => {
    if (!data) return
    const next = {
      name: data.name,
      slug: data.slug,
      season: data.season ?? '',
      description: data.description ?? '',
      cover_image_url: data.cover_image_url ?? '',
      sort_order: String(data.sort_order),
      is_published: data.is_published,
    }
    setForm(next)
    setOriginal(next)
  }, [data])

  useEffect(() => {
    document.title = `${id ? 'Edit collection' : 'Add collection'} | Vastrika Admin`
  }, [id])

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(original), [form, original])
  useLeaveWarning(dirty)

  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }))

  const save = async (event) => {
    event.preventDefault()
    setProblem('')
    const slug = slugify(form.slug)
    if (!form.name.trim()) return setProblem('Add a name.')
    if (!slug) return setProblem('Add a web address using English letters or numbers.')
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      slug,
      season: form.season.trim() || null,
      description: form.description.trim() || null,
      cover_image_url: form.cover_image_url || null,
      sort_order: Number(form.sort_order) || 0,
      is_published: form.is_published,
    }
    try {
      const saved = id
        ? await supabase.from('collections').update(payload).eq('id', id).select('id').single().then(unwrap)
        : await supabase.from('collections').insert(payload).select('id').single().then(unwrap)
      if (original.cover_image_url && original.cover_image_url !== form.cover_image_url) {
        deleteImages([publicIdFromUrl(original.cover_image_url)])
      }
      notify(form.is_published ? 'Collection saved and published' : 'Collection saved as draft')
      setOriginal(form)
      if (id) reload()
      else navigate(`/collections/${saved.id}`, { replace: true })
    } catch (saveError) {
      setProblem(friendlyError(saveError))
    } finally {
      setSaving(false)
    }
    return undefined
  }

  const remove = async () => {
    const accepted = await confirm({
      title: `Delete ${form.name}?`,
      body: 'Its designs stay in your portfolio but will no longer belong to a collection.',
      action: 'Delete collection',
    })
    if (!accepted) return
    const { error: deleteError } = await supabase.from('collections').delete().eq('id', id)
    if (deleteError) {
      notify(friendlyError(deleteError), 'error')
      return
    }
    deleteImages([publicIdFromUrl(original.cover_image_url)])
    setOriginal(form)
    notify('Collection deleted')
    navigate('/collections')
  }

  if (loading || error) return <LoadState loading={loading} error={error} retry={reload} />
  if (id && !data) {
    return (
      <div className="panel">
        <p>This collection no longer exists.</p>
        <Link className="button" to="/collections">Back to collections</Link>
      </div>
    )
  }

  return (
    <form onSubmit={save} noValidate>
      <PageHead title={id ? form.name || 'Edit collection' : 'Add collection'}>
        <Link className="button" to="/collections">Back</Link>
        <button className="button primary" disabled={saving || uploading}>
          {saving ? 'Saving…' : uploading ? 'Uploading…' : 'Save collection'}
        </button>
      </PageHead>
      {problem && <p className="error banner" role="alert">{problem}</p>}
      <div className="edit-grid">
        <section className="panel">
          <h2>Details</h2>
          <TextField
            label="Name"
            value={form.name}
            onChange={(name) => setForm((current) => ({
              ...current,
              name,
              slug: slugTouched ? current.slug : slugify(name),
            }))}
          />
          <TextField label="Season" value={form.season} onChange={set('season')} placeholder="Festive 2026" />
          <TextArea label="Description" value={form.description} onChange={set('description')} />
          <CoverField label="Cover image" url={form.cover_image_url} onChange={set('cover_image_url')} onUploadingChange={setUploading} />
        </section>
        <div className="stack">
          <section className="panel">
            <h2>Visibility</h2>
            <Toggle label="Published" hint="Show on the portfolio" checked={form.is_published} onChange={set('is_published')} />
            <TextField label="Position" hint="Lower numbers appear first" type="number" value={form.sort_order} onChange={set('sort_order')} />
            <TextField
              label="Web address"
              hint={form.slug ? `/collections/${slugify(form.slug)}` : 'Created from the name'}
              value={form.slug}
              onChange={(value) => {
                setSlugTouched(true)
                set('slug')(value)
              }}
            />
          </section>
          {id && <button type="button" className="button danger" onClick={remove}>Delete collection</button>}
        </div>
      </div>
    </form>
  )
}
