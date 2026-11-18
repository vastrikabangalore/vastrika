import { Link } from 'react-router-dom'
import About from '../components/About'
import { CollectionList, Picture, usePageTitle, WorkGrid } from '../components/Common'
import Contact from '../components/Contact'
import Services from '../components/Services'
import { formatDate, getCollections, getDesigns, getPosts, useContent } from '../lib/content'

const loadHome = () => Promise.all([getDesigns(), getCollections(), getPosts()])

export default function Home() {
  usePageTitle()
  const { data } = useContent(loadHome)
  const [designs = [], collections = [], posts = []] = data ?? []
  const featured = designs.filter((d) => d.is_featured)
  const pool = featured.length ? featured : designs
  const lead = pool.find((d) => d.images[0]) ?? pool[0]
  const selected = pool.filter((d) => d !== lead).slice(0, 5)

  return (
    <>
      <section className="hero">
        <h1>Vastrika</h1>
        <div className="hero-body">
          <div className="hero-copy">
            <p>Contemporary Indian couture from Bangalore, rooted in handloom.</p>
            <Link to="/designs" className="btn">View designs</Link>
          </div>
          {lead && (
            <Link to={`/designs/${lead.slug}`} className="hero-image">
              <Picture
                url={lead.images[0]?.url}
                alt={lead.images[0]?.alt_text || lead.title}
                color={lead.color}
                label={lead.title}
                sizes="(max-width: 760px) 100vw, 60vw"
                priority
              />
            </Link>
          )}
        </div>
      </section>

      {selected.length > 0 && (
        <section className="band">
          <div className="band-head">
            <h2>Selected designs</h2>
            <Link to="/designs">All designs</Link>
          </div>
          <WorkGrid designs={selected} />
        </section>
      )}

      {collections.length > 0 && (
        <section className="band">
          <div className="band-head">
            <h2>Collections</h2>
            <Link to="/collections">All collections</Link>
          </div>
          <CollectionList collections={collections.slice(0, 3)} />
        </section>
      )}

      <About />
      <Services />

      {posts.length > 0 && (
        <section className="band">
          <div className="band-head">
            <h2>From the journal</h2>
            <Link to="/journal">All posts</Link>
          </div>
          <div className="post-list">
            {posts.slice(0, 3).map((post) => (
              <Link key={post.id} to={`/journal/${post.slug}`} className="post-row">
                <h3>{post.title}</h3>
                <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Contact />
    </>
  )
}
