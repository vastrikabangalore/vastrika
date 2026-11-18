import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { LoadError, Picture, Reveal, Skeleton, SplitText, usePageTitle } from '../components/Motion'
import { formatDate, getPost, useContent } from '../lib/content'
import NotFound from './NotFound'

export default function Post() {
  const { slug } = useParams()
  const load = useCallback(() => getPost(slug), [slug])
  const { data: post, error, loading, retry } = useContent(load)
  usePageTitle(post?.title)

  if (loading) return <section className="band first"><Skeleton variant="detail" /></section>
  if (error) return <LoadError retry={retry} />
  if (!post) return <NotFound />

  const blocks = (post.body ?? '').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)

  return (
    <article className="post">
      <SplitText as="h1" text={post.title} onLoad delay={0.2} />
      <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
      {post.cover_image_url && (
        <Picture url={post.cover_image_url} sizes="(max-width: 760px) 100vw, 720px" priority />
      )}
      {blocks.map((block, index) => (
        <Reveal key={index} y={16}>
          {block.startsWith('## ') ? <h2>{block.slice(3)}</h2> : <p>{block}</p>}
        </Reveal>
      ))}
    </article>
  )
}
