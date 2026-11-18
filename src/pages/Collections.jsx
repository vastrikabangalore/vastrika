import { LoadError, Skeleton, SplitText, usePageTitle } from '../components/Motion'
import { CollectionStack } from '../components/Work'
import { getCollections, useContent } from '../lib/content'

export default function Collections() {
  usePageTitle('Collections')
  const { data, error, loading, retry } = useContent(getCollections)

  return (
    <section className="band first">
      <SplitText as="h1" className="page-title" text="Collections" onLoad delay={0.2} />
      {loading && <Skeleton />}
      {error && <LoadError retry={retry} />}
      {data?.length > 0 && <CollectionStack collections={data} />}
      {data?.length === 0 && <p className="status">New collections are on the way.</p>}
    </section>
  )
}
