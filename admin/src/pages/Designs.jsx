import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LoadState, PageHead, Status, useFeedback } from '../components/ui'
import { deleteImages } from '../lib/cloudinary'
import { coverOf, friendlyError, thumb, unwrap, useLoad } from '../lib/helpers'
import { supabase } from '../lib/supabase'

const loadDesigns = () => Promise.all([
  supabase
    .from('designs')
    .select(`id, title, is_published, is_featured, category_id, collection_id,
      category:categories(name), collection:collections(name),
      images:design_images(url, cloudinary_public_id, is_cover, sort_order)`)
    .order('sort_order')
    .order('created_at', { ascending: false })
    .then(unwrap),
  supabase.from('categories').select('id, name').order('name').then(unwrap),
  supabase.from('collections').select('id, name').order('name').then(unwrap),
])

export default function Designs() {
  useEffect(() => { document.title = 'Designs | Vastrika Admin' }, [])
  const { data, loading, error, reload } = useLoad(loadDesigns)
  const { notify, confirm } = useFeedback()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [collection, setCollection] = useState('')
  const [status, setStatus] = useState('')

  const [designs = [], categories = [], collections = []] = data ?? []

  const shown = useMemo(() => designs.filter((design) => (
    design.title.toLowerCase().includes(search.trim().toLowerCase())
    && (!category || design.category_id === category)
    && (!collection || design.collection_id === collection)
    && (!status || design.is_published === (status === 'published'))
  )), [designs, search, category, collection, status])

  const togglePublished = async (design) => {
    const { error: saveError } = await supabase
      .from('designs')
      .update({ is_published: !design.is_published })
      .eq('id', design.id)
    if (saveError) {
      notify(friendlyError(saveError), 'error')
      return
    }
    notify(design.is_published ? 'Design unpublished' : 'Design published')
    reload()
  }

  const remove = async (design) => {
    const accepted = await confirm({
      title: `Delete ${design.title}?`,
      body: 'The design and its images will be removed from the site. This cannot be undone.',
      action: 'Delete design',
    })
    if (!accepted) return
    const { error: deleteError } = await supabase.from('designs').delete().eq('id', design.id)
    if (deleteError) {
      notify(friendlyError(deleteError), 'error')
      return
    }
    deleteImages(design.images.map((image) => image.cloudinary_public_id))
    notify('Design deleted')
    reload()
  }

  return (
    <>
      <PageHead title="Designs">
        <Link className="button primary" to="/designs/new">Add design</Link>
      </PageHead>
      <LoadState loading={loading} error={error} retry={reload} />
      {data && designs.length === 0 && (
        <div className="panel">
          <p>Add your first design with its images, title and description.</p>
          <Link className="button primary" to="/designs/new">Add design</Link>
        </div>
      )}
      {designs.length > 0 && (
        <>
          <div className="filters">
            <input aria-label="Search designs" type="search" placeholder="Search by title" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select aria-label="Filter by collection" value={collection} onChange={(e) => setCollection(e.target.value)}>
              <option value="">All collections</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
          {shown.length === 0 && <p className="muted">No designs match these filters.</p>}
          <ul className="rows">
            {shown.map((design) => {
              const cover = coverOf(design.images)
              const meta = [design.category?.name, design.collection?.name].filter(Boolean).join(', ')
              return (
                <li key={design.id}>
                  <Link className="row-main" to={`/designs/${design.id}`}>
                    <span className="thumb">{cover && <img src={thumb(cover.url)} alt="" />}</span>
                    <span>
                      <strong>{design.title}</strong>
                      <small>{meta || 'No category or collection'}{design.is_featured ? ', featured' : ''}</small>
                    </span>
                  </Link>
                  <Status published={design.is_published} />
                  <div className="row-actions">
                    <button onClick={() => togglePublished(design)}>{design.is_published ? 'Unpublish' : 'Publish'}</button>
                    <button className="text-danger" onClick={() => remove(design)} aria-label={`Delete ${design.title}`}>Delete</button>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </>
  )
}
