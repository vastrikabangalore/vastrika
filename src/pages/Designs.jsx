import { useSearchParams } from 'react-router-dom'
import { Loading, LoadError, usePageTitle, WorkGrid } from '../components/Common'
import { getCategories, getDesigns, useContent } from '../lib/content'

const loadDesigns = () => Promise.all([getDesigns(), getCategories()])

export default function Designs() {
  usePageTitle('Designs')
  const { data, error, loading, retry } = useContent(loadDesigns)
  const [params, setParams] = useSearchParams()
  const active = params.get('category')

  const [designs = [], categories = []] = data ?? []
  const used = categories.filter((c) => designs.some((d) => d.category?.slug === c.slug))
  const shown = active ? designs.filter((d) => d.category?.slug === active) : designs

  return (
    <section className="band first">
      <h1 className="page-title">Designs</h1>
      {loading && <Loading />}
      {error && <LoadError retry={retry} />}
      {data && used.length > 0 && (
        <div className="filters" role="group" aria-label="Filter by category">
          <button aria-pressed={!active} onClick={() => setParams({})}>All</button>
          {used.map((category) => (
            <button
              key={category.id}
              aria-pressed={active === category.slug}
              onClick={() => setParams({ category: category.slug })}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
      {data && shown.length > 0 && <WorkGrid designs={shown} />}
      {data && shown.length === 0 && <p className="status">New designs are on the way.</p>}
    </section>
  )
}
