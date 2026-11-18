import { supabase } from './supabase'

export const MAX_IMAGE_MB = 10

async function callFunction(body) {
  const { data, error } = await supabase.functions.invoke('cloudinary-sign', { body })
  if (!error) return data
  const details = await error.context?.json?.().catch(() => null)
  throw new Error(
    details?.error ?? 'Image uploads are not ready. Deploy the cloudinary-sign function and set its keys.',
  )
}

export const getUploadTicket = () => callFunction({ action: 'sign' })

export function checkImage(file) {
  if (!file.type.startsWith('image/')) return `${file.name} is not an image.`
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `${file.name} is larger than ${MAX_IMAGE_MB} MB.`
  return null
}

export function uploadImage(file, ticket, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('file', file)
    form.append('api_key', ticket.apiKey)
    form.append('timestamp', ticket.timestamp)
    form.append('folder', ticket.folder)
    form.append('signature', ticket.signature)

    const request = new XMLHttpRequest()
    request.open('POST', `https://api.cloudinary.com/v1_1/${ticket.cloudName}/image/upload`)
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    }
    request.onerror = () => reject(new Error(`${file.name} could not be uploaded. Check your connection.`))
    request.onload = () => {
      let result = {}
      try {
        result = JSON.parse(request.responseText)
      } catch {
        // handled below
      }
      if (request.status >= 200 && request.status < 300 && result.secure_url) {
        resolve({ url: result.secure_url, publicId: result.public_id })
      } else {
        reject(new Error(result.error?.message ?? `${file.name} could not be uploaded.`))
      }
    }
    request.send(form)
  })
}

export function publicIdFromUrl(url) {
  const match = url?.match(/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i)
  return match ? decodeURIComponent(match[1]) : null
}

// Frees storage after a record is saved. A failure here never blocks the edit.
export async function deleteImages(publicIds) {
  const ids = publicIds.filter(Boolean)
  await Promise.allSettled(ids.map((publicId) => callFunction({ action: 'destroy', publicId })))
}
