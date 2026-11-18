import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Loading, LoadError, Picture, usePageTitle } from '../components/Common'
import { site } from '../data'
import { getDesign, useContent } from '../lib/content'
import NotFound from './NotFound'

export default function DesignDetail() {
  const { slug } = useParams()
  const load = useCallback(() => getDesign(slug), [slug])
  const { data: design, error, loading, retry } = useContent(load)
  usePageTitle(design?.title)

  if (loading) return <Loading />
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

  return (
    <article className="design">
      <div className="design-images">
        {design.images.length === 0 && <Picture color={design.color} label={design.title} />}
        {design.images.map((image, index) => (
          <Picture
            key={image.id}
            url={image.url}
            alt={image.alt_text || `${design.title}, image ${index + 1}`}
            sizes="(max-width: 860px) 100vw, 60vw"
            priority={index === 0}
          />
        ))}
      </div>
      <div className="design-info">
        <h1>{design.title}</h1>
        {design.description && <p>{design.description}</p>}
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
        <a className="btn" href={`mailto:${site.email}?subject=${subject}`}>Enquire about this design</a>
      </div>
    </article>
  )
}
