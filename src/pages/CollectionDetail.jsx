import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { LoadError, Reveal, Skeleton, SplitText, usePageTitle } from '../components/Motion'
import { WorkGrid } from '../components/Work'
import { getCollection, getDesigns, useContent } from '../lib/content'
import NotFound from './NotFound'

export default function CollectionDetail() {
  const { slug } = useParams()
  const load = useCallback(() => Promise.all([getCollection(slug), getDesigns()]), [slug])
  const { data, error, loading, retry } = useContent(load)
  const [collection, designs = []] = data ?? []
  usePageTitle(collection?.name)

  if (loading) return <section className="band first"><Skeleton /></section>
  if (error) return <LoadError retry={retry} />
  if (!collection) return <NotFound />

  const shown = designs.filter((d) => d.collection?.slug === slug)

  return (
    <section className="band first">
      <SplitText as="h1" className="page-title" text={collection.name} onLoad delay={0.2} />
      <Reveal className="intro-copy" delay={0.35}>
        {collection.season && <p className="muted">{collection.season}</p>}
        {collection.description && <p>{collection.description}</p>}
      </Reveal>
      {shown.length > 0
        ? <WorkGrid designs={shown} />
        : <p className="status">Designs from this collection are on the way.</p>}
    </section>
  )
}
