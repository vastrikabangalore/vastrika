import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CoverField } from '../components/Images'
import { LoadState, PageHead, TextArea, TextField, Toggle, useFeedback } from '../components/ui'
import { deleteImages, publicIdFromUrl } from '../lib/cloudinary'
import { friendlyError, slugify, unwrap, useLeaveWarning, useLoad } from '../lib/helpers'
import { supabase } from '../lib/supabase'

const blank = { title: '', slug: '', excerpt: '', body: '', cover_image_url: '', is_published: false }

export default function PostEdit() {
  const { id } = useParams()
  return <Editor key={id ?? 'new'} id={id} />
}

function Editor({ id }) {
  const navigate = useNavigate()
  const { notify, confirm } = useFeedback()
  const load = useCallback(
    async () => (id ? supabase.from('posts').select('*').eq('id', id).maybeSingle().then(unwrap) : null),
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
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt ?? '',
      body: data.body ?? '',
      cover_image_url: data.cover_image_url ?? '',
      is_published: data.is_published,
    }
    setForm(next)
    setOriginal(next)
  }, [data])

  useEffect(() => {
    document.title = `${id ? 'Edit post' : 'Add post'} | Vastrika Admin`
  }, [id])

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(original), [form, original])
  useLeaveWarning(dirty)

  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }))

  const save = async (event) => {
    event.preventDefault()
    setProblem('')
    const slug = slugify(form.slug)
    if (!form.title.trim()) return setProblem('Add a title.')
    if (!slug) return setProblem('Add a web address using English letters or numbers.')
    setSaving(true)
    const payload = {
      title: form.title.trim(),
      slug,
      excerpt: form.excerpt.trim() || null,
      body: form.body.trim() || null,
      cover_image_url: form.cover_image_url || null,
      is_published: form.is_published,
      published_at: form.is_published ? data?.published_at ?? new Date().toISOString() : data?.published_at ?? null,
    }
    try {
      const saved = id
        ? await supabase.from('posts').update(payload).eq('id', id).select('id').single().then(unwrap)
        : await supabase.from('posts').insert(payload).select('id').single().then(unwrap)
      if (original.cover_image_url && original.cover_image_url !== form.cover_image_url) {
        deleteImages([publicIdFromUrl(original.cover_image_url)])
      }
      notify(form.is_published ? 'Post saved and published' : 'Post saved as draft')
      setOriginal(form)
      if (id) reload()
      else navigate(`/posts/${saved.id}`, { replace: true })
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
      body: 'This post will be removed from the site. This cannot be undone.',
      action: 'Delete post',
    })
    if (!accepted) return
    const { error: deleteError } = await supabase.from('posts').delete().eq('id', id)
    if (deleteError) {
      notify(friendlyError(deleteError), 'error')
      return
    }
    deleteImages([publicIdFromUrl(original.cover_image_url)])
    setOriginal(form)
    notify('Post deleted')
    navigate('/posts')
  }

  if (loading || error) return <LoadState loading={loading} error={error} retry={reload} />
  if (id && !data) {
    return (
      <div className="panel">
        <p>This post no longer exists.</p>
        <Link className="button" to="/posts">Back to posts</Link>
      </div>
    )
  }

  return (
    <form onSubmit={save} noValidate>
      <PageHead title={id ? form.title || 'Edit post' : 'Add post'}>
        <Link className="button" to="/posts">Back</Link>
        <button className="button primary" disabled={saving || uploading}>
          {saving ? 'Saving…' : uploading ? 'Uploading…' : 'Save post'}
        </button>
      </PageHead>
      {problem && <p className="error banner" role="alert">{problem}</p>}
      <div className="edit-grid">
        <section className="panel">
          <TextField
            label="Title"
            value={form.title}
            onChange={(title) => setForm((current) => ({
              ...current,
              title,
              slug: slugTouched ? current.slug : slugify(title),
            }))}
          />
          <TextArea label="Short summary" hint="Shown in the list of posts" value={form.excerpt} onChange={set('excerpt')} rows={2} />
          <TextArea
            label="Post"
            hint="Leave a blank line between paragraphs. Start a line with ## to make a heading."
            value={form.body}
            onChange={set('body')}
            rows={16}
          />
        </section>
        <div className="stack">
          <section className="panel">
            <h2>Visibility</h2>
            <Toggle label="Published" hint="Show on the portfolio" checked={form.is_published} onChange={set('is_published')} />
            <TextField
              label="Web address"
              hint={form.slug ? `/journal/${slugify(form.slug)}` : 'Created from the title'}
              value={form.slug}
              onChange={(value) => {
                setSlugTouched(true)
                set('slug')(value)
              }}
            />
          </section>
          <section className="panel">
            <CoverField label="Cover image" url={form.cover_image_url} onChange={set('cover_image_url')} onUploadingChange={setUploading} />
          </section>
          {id && <button type="button" className="button danger" onClick={remove}>Delete post</button>}
        </div>
      </div>
    </form>
  )
}
