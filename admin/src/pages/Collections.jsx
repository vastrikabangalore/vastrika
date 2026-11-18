import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LoadState, PageHead, Status, useFeedback } from '../components/ui'
import { deleteImages, publicIdFromUrl } from '../lib/cloudinary'
import { friendlyError, thumb, unwrap, useLoad } from '../lib/helpers'
import { supabase } from '../lib/supabase'

const loadCollections = () => supabase
  .from('collections')
  .select('id, name, season, cover_image_url, is_published, designs(count)')
  .order('sort_order')
  .order('created_at', { ascending: false })
  .then(unwrap)

export default function Collections() {
  useEffect(() => { document.title = 'Collections | Vastrika Admin' }, [])
  const { data, loading, error, reload } = useLoad(loadCollections)
  const { notify, confirm } = useFeedback()

  const togglePublished = async (collection) => {
    const { error: saveError } = await supabase
      .from('collections')
      .update({ is_published: !collection.is_published })
      .eq('id', collection.id)
    if (saveError) {
      notify(friendlyError(saveError), 'error')
      return
    }
    notify(collection.is_published ? 'Collection unpublished' : 'Collection published')
    reload()
  }

  const remove = async (collection) => {
    const accepted = await confirm({
      title: `Delete ${collection.name}?`,
      body: 'Its designs stay in your portfolio but will no longer belong to a collection.',
      action: 'Delete collection',
    })
    if (!accepted) return
    const { error: deleteError } = await supabase.from('collections').delete().eq('id', collection.id)
    if (deleteError) {
      notify(friendlyError(deleteError), 'error')
      return
    }
    deleteImages([publicIdFromUrl(collection.cover_image_url)])
    notify('Collection deleted')
    reload()
  }

  return (
    <>
      <PageHead title="Collections">
        <Link className="button primary" to="/collections/new">Add collection</Link>
      </PageHead>
      <LoadState loading={loading} error={error} retry={reload} />
      {data?.length === 0 && (
        <div className="panel">
          <p>Group related designs, such as a season or a bridal line, into a collection.</p>
          <Link className="button primary" to="/collections/new">Add collection</Link>
        </div>
      )}
      {data?.length > 0 && (
        <ul className="rows">
          {data.map((collection) => {
            const total = collection.designs[0]?.count ?? 0
            return (
              <li key={collection.id}>
                <Link className="row-main" to={`/collections/${collection.id}`}>
                  <span className="thumb">{collection.cover_image_url && <img src={thumb(collection.cover_image_url)} alt="" />}</span>
                  <span>
                    <strong>{collection.name}</strong>
                    <small>{[collection.season, `${total} ${total === 1 ? 'design' : 'designs'}`].filter(Boolean).join(', ')}</small>
                  </span>
                </Link>
                <Status published={collection.is_published} />
                <div className="row-actions">
                  <button onClick={() => togglePublished(collection)}>{collection.is_published ? 'Unpublish' : 'Publish'}</button>
                  <button className="text-danger" onClick={() => remove(collection)} aria-label={`Delete ${collection.name}`}>Delete</button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
