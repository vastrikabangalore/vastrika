import { Link } from 'react-router-dom'
import { Loading, LoadError, usePageTitle } from '../components/Common'
import { formatDate, getPosts, useContent } from '../lib/content'

export default function Journal() {
  usePageTitle('Journal')
  const { data, error, loading, retry } = useContent(getPosts)

  return (
    <section className="band first">
      <h1 className="page-title">Journal</h1>
      {loading && <Loading />}
      {error && <LoadError retry={retry} />}
      {data?.length === 0 && <p className="status">The first post is on the way.</p>}
      {data?.length > 0 && (
        <div className="post-list">
          {data.map((post) => (
            <Link key={post.id} to={`/journal/${post.slug}`} className="post-row">
              <div>
                <h3>{post.title}</h3>
                {post.excerpt && <p>{post.excerpt}</p>}
              </div>
              <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
