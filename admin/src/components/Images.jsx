import { useRef, useState } from 'react'
import { checkImage, getUploadTicket, MAX_IMAGE_MB, uploadImage } from '../lib/cloudinary'
import { friendlyError, thumb } from '../lib/helpers'
import { useFeedback } from './ui'

const PARALLEL_UPLOADS = 3

function usePicker(onFiles) {
  const input = useRef(null)
  const element = (
    <input
      ref={input}
      type="file"
      accept="image/*"
      multiple
      hidden
      aria-label="Choose images"
      onChange={(event) => {
        onFiles([...event.target.files])
        event.target.value = ''
      }}
    />
  )
  return { element, open: () => input.current?.click() }
}

export function ImageGallery({ images, onChange, onUploadingChange }) {
  const { notify } = useFeedback()
  const [uploads, setUploads] = useState([])
  const latest = useRef(images)
  latest.current = images

  const addFiles = async (files) => {
    const valid = []
    for (const file of files) {
      const problem = checkImage(file)
      if (problem) notify(problem, 'error')
      else valid.push(file)
    }
    if (!valid.length) return

    const queue = valid.map((file) => ({ key: crypto.randomUUID(), file, progress: 0 }))
    setUploads((current) => [...current, ...queue.map(({ key, file, progress }) => ({ key, name: file.name, progress }))])
    onUploadingChange?.(true)

    try {
      const ticket = await getUploadTicket()
      const pending = [...queue]
      const worker = async () => {
        while (pending.length) {
          const item = pending.shift()
          try {
            const result = await uploadImage(item.file, ticket, (progress) => {
              setUploads((current) => current.map((u) => (u.key === item.key ? { ...u, progress } : u)))
            })
            const next = [...latest.current, {
              id: crypto.randomUUID(),
              url: result.url,
              cloudinary_public_id: result.publicId,
              alt_text: '',
              is_cover: latest.current.length === 0,
            }]
            latest.current = next
            onChange(next)
          } catch (error) {
            notify(friendlyError(error), 'error')
          } finally {
            setUploads((current) => current.filter((u) => u.key !== item.key))
          }
        }
      }
      await Promise.all(Array.from({ length: PARALLEL_UPLOADS }, worker))
    } catch (error) {
      notify(friendlyError(error), 'error')
      const keys = new Set(queue.map((item) => item.key))
      setUploads((current) => current.filter((u) => !keys.has(u.key)))
    } finally {
      onUploadingChange?.(false)
    }
  }

  const picker = usePicker(addFiles)

  const update = (id, patch) => onChange(images.map((image) => (image.id === id ? { ...image, ...patch } : image)))
  const setCover = (id) => onChange(images.map((image) => ({ ...image, is_cover: image.id === id })))
  const move = (index, step) => {
    const next = [...images]
    const [item] = next.splice(index, 1)
    next.splice(index + step, 0, item)
    onChange(next)
  }
  const remove = (id) => {
    const next = images.filter((image) => image.id !== id)
    if (next.length && !next.some((image) => image.is_cover)) next[0] = { ...next[0], is_cover: true }
    onChange(next)
  }

  return (
    <div>
      {picker.element}
      <button
        type="button"
        className="dropzone"
        onClick={picker.open}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          addFiles([...event.dataTransfer.files])
        }}
      >
        <strong>Add images</strong>
        <span>Choose or drop files, up to {MAX_IMAGE_MB} MB each</span>
      </button>

      {uploads.length > 0 && (
        <ul className="uploads" aria-live="polite">
          {uploads.map((upload) => (
            <li key={upload.key}>
              <span>{upload.name}</span>
              <progress max="100" value={upload.progress} aria-label={`Uploading ${upload.name}`} />
            </li>
          ))}
        </ul>
      )}

      <ul className="gallery">
        {images.map((image, index) => (
          <li key={image.id}>
            <div className="gallery-img">
              <img src={thumb(image.url, 400)} alt={image.alt_text || `Image ${index + 1}`} />
              {image.is_cover && <span className="cover-tag">Cover</span>}
            </div>
            <input
              aria-label={`Description of image ${index + 1}`}
              placeholder="Describe this image"
              value={image.alt_text ?? ''}
              onChange={(event) => update(image.id, { alt_text: event.target.value })}
            />
            <div className="gallery-actions">
              <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Move image ${index + 1} earlier`}>Earlier</button>
              <button type="button" disabled={index === images.length - 1} onClick={() => move(index, 1)} aria-label={`Move image ${index + 1} later`}>Later</button>
              {!image.is_cover && <button type="button" onClick={() => setCover(image.id)} aria-label={`Make image ${index + 1} the cover`}>Make cover</button>}
              <button type="button" className="text-danger" onClick={() => remove(image.id)} aria-label={`Remove image ${index + 1}`}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CoverField({ label, url, onChange, onUploadingChange }) {
  const { notify } = useFeedback()
  const [progress, setProgress] = useState(null)

  const pick = async ([file]) => {
    if (!file) return
    const problem = checkImage(file)
    if (problem) {
      notify(problem, 'error')
      return
    }
    setProgress(0)
    onUploadingChange?.(true)
    try {
      const ticket = await getUploadTicket()
      const result = await uploadImage(file, ticket, setProgress)
      onChange(result.url)
    } catch (error) {
      notify(friendlyError(error), 'error')
    } finally {
      setProgress(null)
      onUploadingChange?.(false)
    }
  }

  const picker = usePicker(pick)

  return (
    <div className="field">
      <span className="label">{label}</span>
      {picker.element}
      {url && <img className="cover-preview" src={thumb(url, 700)} alt="" />}
      {progress !== null && <progress max="100" value={progress} aria-label="Uploading image" />}
      <div className="actions">
        <button type="button" className="button" disabled={progress !== null} onClick={picker.open}>
          {url ? 'Replace image' : 'Add image'}
        </button>
        {url && <button type="button" className="button" onClick={() => onChange('')}>Remove image</button>}
      </div>
    </div>
  )
}
