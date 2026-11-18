import { Link } from 'react-router-dom'
import { LoadError, Reveal, Skeleton, SplitText, usePageTitle } from '../components/Motion'
import { formatDate, getPosts, useContent } from '../lib/content'

export default function Journal() {
  usePageTitle('Journal')
  const { data, error, loading, retry } = useContent(getPosts)

  return (
    <section className="band first">
      <SplitText as="h1" className="page-title" text="Journal" onLoad delay={0.2} />
      {loading && <Skeleton />}
      {error && <LoadError retry={retry} />}
      {data?.length === 0 && <p className="status">The first post is on the way.</p>}
      {data?.length > 0 && (
        <div className="post-list">
          {data.map((post) => (
            <Reveal key={post.id}>
              <Link to={`/journal/${post.slug}`} className="post-row" data-cursor="Read">
                <div>
                  <h3>{post.title}</h3>
                  {post.excerpt && <p>{post.excerpt}</p>}
                </div>
                <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  )
}
