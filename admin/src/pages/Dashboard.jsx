import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LoadState, PageHead, Status } from '../components/ui'
import { coverOf, thumb, unwrap, useLoad } from '../lib/helpers'
import { supabase } from '../lib/supabase'

async function count(table, filter) {
  let query = supabase.from(table).select('id', { count: 'exact', head: true })
  if (filter) query = query.eq('is_published', false)
  const { count: total, error } = await query
  if (error) throw error
  return total
}

async function loadOverview() {
  const [designs, drafts, collections, categories, posts, recent] = await Promise.all([
    count('designs'),
    count('designs', true),
    count('collections'),
    count('categories'),
    count('posts'),
    supabase
      .from('designs')
      .select('id, title, is_published, images:design_images(url, is_cover, sort_order)')
      .order('updated_at', { ascending: false })
      .limit(5)
      .then(unwrap),
  ])
  return { designs, drafts, collections, categories, posts, recent }
}

export default function Dashboard() {
  useEffect(() => { document.title = 'Overview | Vastrika Admin' }, [])
  const { data, loading, error, reload } = useLoad(loadOverview)

  return (
    <>
      <PageHead title="Overview">
        <Link className="button primary" to="/designs/new">Add design</Link>
      </PageHead>
      <LoadState loading={loading} error={error} retry={reload} />
      {data && (
        <>
          <div className="stats">
            <Link to="/designs"><b>{data.designs}</b> Designs{data.drafts > 0 && <small>{data.drafts} in draft</small>}</Link>
            <Link to="/collections"><b>{data.collections}</b> Collections</Link>
            <Link to="/categories"><b>{data.categories}</b> Categories</Link>
            <Link to="/posts"><b>{data.posts}</b> Posts</Link>
          </div>
          <h2 className="section-title">Recently edited</h2>
          {data.recent.length === 0
            ? <p className="muted">Add your first design to start building the portfolio.</p>
            : (
              <ul className="rows">
                {data.recent.map((design) => (
                  <li key={design.id}>
                    <Link className="row-main" to={`/designs/${design.id}`}>
                      <span className="thumb">{coverOf(design.images) && <img src={thumb(coverOf(design.images).url)} alt="" />}</span>
                      <strong>{design.title}</strong>
                    </Link>
                    <Status published={design.is_published} />
                  </li>
                ))}
              </ul>
            )}
        </>
      )}
    </>
  )
}
