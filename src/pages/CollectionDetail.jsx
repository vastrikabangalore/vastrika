import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Loading, LoadError, usePageTitle, WorkGrid } from '../components/Common'
import { getCollection, getDesigns, useContent } from '../lib/content'
import NotFound from './NotFound'

export default function CollectionDetail() {
  const { slug } = useParams()
  const load = useCallback(() => Promise.all([getCollection(slug), getDesigns()]), [slug])
  const { data, error, loading, retry } = useContent(load)
  const [collection, designs = []] = data ?? []
  usePageTitle(collection?.name)

  if (loading) return <Loading />
  if (error) return <LoadError retry={retry} />
  if (!collection) return <NotFound />

  const shown = designs.filter((d) => d.collection?.slug === slug)

  return (
    <section className="band first">
      <h1 className="page-title">{collection.name}</h1>
      <div className="intro">
        {collection.season && <p className="muted">{collection.season}</p>}
        {collection.description && <p>{collection.description}</p>}
      </div>
      {shown.length > 0
        ? <WorkGrid designs={shown} />
        : <p className="status">Designs from this collection are on the way.</p>}
    </section>
  )
}
