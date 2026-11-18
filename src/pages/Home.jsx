import { Link } from 'react-router-dom'
import { Contact, Hero, Marquee, Services, Statement } from '../components/HomeSections'
import { Reveal, SplitText, usePageTitle } from '../components/Motion'
import { CollectionsRail, WorkGrid } from '../components/Work'
import { formatDate, getCollections, getDesigns, getPosts, useContent } from '../lib/content'

const loadHome = () => Promise.all([getDesigns(), getCollections(), getPosts()])

export default function Home() {
  usePageTitle()
  const { data } = useContent(loadHome)
  const [designs = [], collections = [], posts = []] = data ?? []
  const featured = designs.filter((d) => d.is_featured)
  const pool = featured.length ? featured : designs

  return (
    <>
      <Hero designs={pool} />
      <Marquee />
      <Statement />

      {pool.length > 0 && (
        <section className="band">
          <div className="band-head">
            <SplitText text="Selected designs" />
            <Link to="/designs">All designs</Link>
          </div>
          <WorkGrid designs={pool.slice(0, 5)} parallax />
        </section>
      )}

      {collections.length > 0 && <CollectionsRail collections={collections} />}

      <Services />

      {posts.length > 0 && (
        <section className="band journal-band">
          <div className="band-head">
            <SplitText text="From the journal" />
            <Link to="/journal">All posts</Link>
          </div>
          <div className="post-list">
            {posts.slice(0, 3).map((post) => (
              <Reveal key={post.id}>
                <Link to={`/journal/${post.slug}`} className="post-row" data-cursor="Read">
                  <h3>{post.title}</h3>
                  <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <Contact />
    </>
  )
}
