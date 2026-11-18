import { AnimatePresence } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Lightbox from '../components/Lightbox'
import { LoadError, Picture, Reveal, Skeleton, SplitText, usePageTitle } from '../components/Motion'
import { site } from '../data'
import { getDesign, getDesigns, useContent } from '../lib/content'
import NotFound from './NotFound'

export default function DesignDetail() {
  const { slug } = useParams()
  const load = useCallback(() => Promise.all([getDesign(slug), getDesigns()]), [slug])
  const { data, error, loading, retry } = useContent(load)
  const [design, designs = []] = data ?? []
  const [viewer, setViewer] = useState(null)
  const [slide, setSlide] = useState(1)
  const closeViewer = useCallback(() => setViewer(null), [])
  const gallery = useRef(null)
  usePageTitle(design?.title)

  if (loading) return <Skeleton variant="detail" />
  if (error) return <LoadError retry={retry} />
  if (!design) return <NotFound />

  const details = [
    ['Category', design.category?.name],
    ['Collection', design.collection && (
      <Link to={`/collections/${design.collection.slug}`}>{design.collection.name}</Link>
    )],
    ['Fabric', design.fabric],
    ['Colours', design.colors.join(', ')],
    ['Year', design.design_year],
  ].filter(([, value]) => value)

  const subject = encodeURIComponent(`Enquiry about ${design.title}`)
  const position = designs.findIndex((item) => item.id === design.id)
  const next = designs.length > 1 ? designs[(position + 1) % designs.length] : null

  const trackSlide = () => {
    const element = gallery.current
    if (element) setSlide(Math.round(element.scrollLeft / element.clientWidth) + 1)
  }

  return (
    <>
      <article className="design">
        <div className="design-gallery">
          <div className="design-images" ref={gallery} onScroll={trackSlide}>
            {design.images.length === 0 && <Picture label={design.title} />}
            {design.images.map((image, index) => (
              <button
                key={image.id}
                className="design-image"
                data-cursor="Enlarge"
                onClick={() => setViewer(index)}
                aria-label={`Enlarge image ${index + 1} of ${design.images.length}`}
              >
                <Picture
                  url={image.url}
                  alt={image.alt_text || `${design.title}, image ${index + 1}`}
                  sizes="(max-width: 900px) 100vw, 60vw"
                  priority={index === 0}
                />
              </button>
            ))}
          </div>
          {design.images.length > 1 && (
            <p className="slide-count" aria-hidden="true">{slide} of {design.images.length}</p>
          )}
        </div>
        <div className="design-info">
          <SplitText as="h1" text={design.title} onLoad delay={0.25} />
          <Reveal delay={0.4}>
            {design.description && <p className="design-text">{design.description}</p>}
            {details.length > 0 && (
              <dl className="details">
                {details.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <a className="btn" href={`mailto:${site.email}?subject=${subject}`}>
              <span>Enquire about this design</span>
            </a>
          </Reveal>
        </div>
      </article>

      {next && (
        <Link to={`/designs/${next.slug}`} className="next-design" data-cursor="Next">
          <span>Next design</span>
          <SplitText as="h2" text={next.title} />
          {next.images[0] && <Picture className="arch" url={next.images[0].url} alt="" sizes="30vw" />}
        </Link>
      )}

      <AnimatePresence>
        {viewer !== null && (
          <Lightbox images={design.images} title={design.title} start={viewer} onClose={closeViewer} />
        )}
      </AnimatePresence>
    </>
  )
}
