import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { imageSrcSet, imageUrl } from '../lib/content'

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Vastrika` : 'Vastrika | Fashion Designer, Bangalore'
  }, [title])
}

export function Picture({ url, alt, color, label, sizes, priority = false }) {
  if (!url) {
    return (
      <div className="picture picture-empty" style={color ? { background: color, color: '#fff' } : undefined}>
        <span>{label}</span>
      </div>
    )
  }
  return (
    <div className="picture">
      <img
        src={imageUrl(url, 1000)}
        srcSet={imageSrcSet(url)}
        sizes={sizes}
        alt={alt ?? ''}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  )
}

export function Loading() {
  return <p className="status" role="status">Loading…</p>
}

export function LoadError({ retry }) {
  return (
    <div className="status" role="alert">
      <p>This page could not load. Check your connection and try again.</p>
      <button className="btn" onClick={retry}>Try again</button>
    </div>
  )
}

export function WorkGrid({ designs }) {
  return (
    <div className="lookbook">
      {designs.map((design, index) => {
        const cover = design.images[0]
        return (
          <Link key={design.id} to={`/designs/${design.slug}`} className="look">
            <Picture
              url={cover?.url}
              alt={cover?.alt_text || design.title}
              color={design.color}
              label={design.title}
              priority={index < 2}
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <span className="look-title">{design.title}</span>
            {(design.category || design.collection) && (
              <span className="look-meta">{design.category?.name ?? design.collection?.name}</span>
            )}
          </Link>
        )
      })}
    </div>
  )
}

export function CollectionList({ collections }) {
  return (
    <div className="collection-list">
      {collections.map((collection) => (
        <Link key={collection.id} to={`/collections/${collection.slug}`} className="collection-row">
          <Picture
            url={collection.cover_image_url}
            alt={collection.name}
            color={collection.color}
            label={collection.name}
            sizes="(max-width: 760px) 100vw, 40vw"
          />
          <div>
            <h3>{collection.name}</h3>
            {collection.season && <p className="muted">{collection.season}</p>}
            {collection.description && <p>{collection.description}</p>}
          </div>
        </Link>
      ))}
    </div>
  )
}
