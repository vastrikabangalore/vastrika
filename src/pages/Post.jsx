import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Loading, LoadError, Picture, usePageTitle } from '../components/Common'
import { formatDate, getPost, useContent } from '../lib/content'
import NotFound from './NotFound'

export default function Post() {
  const { slug } = useParams()
  const load = useCallback(() => getPost(slug), [slug])
  const { data: post, error, loading, retry } = useContent(load)
  usePageTitle(post?.title)

  if (loading) return <Loading />
  if (error) return <LoadError retry={retry} />
  if (!post) return <NotFound />

  const blocks = (post.body ?? '').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)

  return (
    <article className="post">
      <h1>{post.title}</h1>
      <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
      {post.cover_image_url && (
        <Picture url={post.cover_image_url} alt="" sizes="(max-width: 760px) 100vw, 720px" priority />
      )}
      {blocks.map((block, index) =>
        block.startsWith('## ')
          ? <h2 key={index}>{block.slice(3)}</h2>
          : <p key={index}>{block}</p>,
      )}
    </article>
  )
}
