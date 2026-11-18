import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LoadState, PageHead, Status, useFeedback } from '../components/ui'
import { deleteImages, publicIdFromUrl } from '../lib/cloudinary'
import { friendlyError, thumb, unwrap, useLoad } from '../lib/helpers'
import { supabase } from '../lib/supabase'

const loadPosts = () => supabase
  .from('posts')
  .select('id, title, excerpt, cover_image_url, is_published, published_at')
  .order('created_at', { ascending: false })
  .then(unwrap)

export default function Posts() {
  useEffect(() => { document.title = 'Posts | Vastrika Admin' }, [])
  const { data, loading, error, reload } = useLoad(loadPosts)
  const { notify, confirm } = useFeedback()

  const togglePublished = async (post) => {
    const publish = !post.is_published
    const { error: saveError } = await supabase
      .from('posts')
      .update({
        is_published: publish,
        published_at: publish ? post.published_at ?? new Date().toISOString() : post.published_at,
      })
      .eq('id', post.id)
    if (saveError) {
      notify(friendlyError(saveError), 'error')
      return
    }
    notify(publish ? 'Post published' : 'Post unpublished')
    reload()
  }

  const remove = async (post) => {
    const accepted = await confirm({
      title: `Delete ${post.title}?`,
      body: 'This post will be removed from the site. This cannot be undone.',
      action: 'Delete post',
    })
    if (!accepted) return
    const { error: deleteError } = await supabase.from('posts').delete().eq('id', post.id)
    if (deleteError) {
      notify(friendlyError(deleteError), 'error')
      return
    }
    deleteImages([publicIdFromUrl(post.cover_image_url)])
    notify('Post deleted')
    reload()
  }

  return (
    <>
      <PageHead title="Posts">
        <Link className="button primary" to="/posts/new">Add post</Link>
      </PageHead>
      <LoadState loading={loading} error={error} retry={reload} />
      {data?.length === 0 && (
        <div className="panel">
          <p>Share studio news, fabric stories or behind-the-scenes notes.</p>
          <Link className="button primary" to="/posts/new">Add post</Link>
        </div>
      )}
      {data?.length > 0 && (
        <ul className="rows">
          {data.map((post) => (
            <li key={post.id}>
              <Link className="row-main" to={`/posts/${post.id}`}>
                <span className="thumb">{post.cover_image_url && <img src={thumb(post.cover_image_url)} alt="" />}</span>
                <span>
                  <strong>{post.title}</strong>
                  {post.excerpt && <small>{post.excerpt}</small>}
                </span>
              </Link>
              <Status published={post.is_published} />
              <div className="row-actions">
                <button onClick={() => togglePublished(post)}>{post.is_published ? 'Unpublish' : 'Publish'}</button>
                <button className="text-danger" onClick={() => remove(post)} aria-label={`Delete ${post.title}`}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
