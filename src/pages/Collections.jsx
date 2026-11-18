import { CollectionList, Loading, LoadError, usePageTitle } from '../components/Common'
import { getCollections, useContent } from '../lib/content'

export default function Collections() {
  usePageTitle('Collections')
  const { data, error, loading, retry } = useContent(getCollections)

  return (
    <section className="band first">
      <h1 className="page-title">Collections</h1>
      {loading && <Loading />}
      {error && <LoadError retry={retry} />}
      {data?.length > 0 && <CollectionList collections={data} />}
      {data?.length === 0 && <p className="status">New collections are on the way.</p>}
    </section>
  )
}
