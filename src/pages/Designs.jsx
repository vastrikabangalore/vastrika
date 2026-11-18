import { motion } from 'motion/react'
import { useSearchParams } from 'react-router-dom'
import { EASE, LoadError, Skeleton, SplitText, usePageTitle } from '../components/Motion'
import { WorkGrid } from '../components/Work'
import { getCategories, getDesigns, useContent } from '../lib/content'

const loadDesigns = () => Promise.all([getDesigns(), getCategories()])

function Filter({ active, onClick, children }) {
  return (
    <button aria-pressed={active} onClick={onClick}>
      {children}
      {active && <motion.i layoutId="filter-line" transition={{ duration: 0.5, ease: EASE }} />}
    </button>
  )
}

export default function Designs() {
  usePageTitle('Designs')
  const { data, error, loading, retry } = useContent(loadDesigns)
  const [params, setParams] = useSearchParams()
  const active = params.get('category')

  const [designs = [], categories = []] = data ?? []
  const used = categories.filter((c) => designs.some((d) => d.category?.slug === c.slug))
  const shown = active ? designs.filter((d) => d.category?.slug === active) : designs
  const choose = (next) => setParams(next, { replace: true, preventScrollReset: true })

  return (
    <section className="band first">
      <SplitText as="h1" className="page-title" text="Designs" onLoad delay={0.2} />
      {loading && <Skeleton />}
      {error && <LoadError retry={retry} />}
      {data && used.length > 0 && (
        <div className="filters" role="group" aria-label="Filter by category">
          <Filter active={!active} onClick={() => choose({})}>All</Filter>
          {used.map((category) => (
            <Filter
              key={category.id}
              active={active === category.slug}
              onClick={() => choose({ category: category.slug })}
            >
              {category.name}
            </Filter>
          ))}
        </div>
      )}
      {data && shown.length > 0 && <WorkGrid designs={shown} />}
      {data && shown.length === 0 && <p className="status">New designs are on the way.</p>}
    </section>
  )
}
