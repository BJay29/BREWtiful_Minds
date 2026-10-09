import { supabase } from './supabase'

const BUCKET = 'barista-media'
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

export const MAX_PORTFOLIO = 6

export function validateImage(file) {
  if (!ACCEPTED.includes(file.type)) return 'Please choose a JPG, PNG or WebP image.'
  if (file.size > 10 * 1024 * 1024) return 'That image is too large. Please choose one under 10 MB.'
  return null
}

async function resizeToBlob(file, { max, square }) {
  const bitmap = await createImageBitmap(file)

  let sx = 0
  let sy = 0
  let sw = bitmap.width
  let sh = bitmap.height

  if (square) {
    const side = Math.min(sw, sh)
    sx = (sw - side) / 2
    sy = (sh - side) / 2
    sw = side
    sh = side
  }

  const scale = Math.min(1, max / Math.max(sw, sh))
  const width = Math.round(sw * scale)
  const height = Math.round(sh * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height)
  bitmap.close?.()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not process this image.'))),
      'image/jpeg',
      0.85
    )
  })
}

export async function uploadImage(userId, file, kind) {
  const options = kind === 'avatar' ? { max: 480, square: true } : { max: 1280, square: false }
  const blob = await resizeToBlob(file, options)

  const id = Math.random().toString(36).slice(2, 8)
  const path = `${userId}/${kind}-${Date.now()}-${id}.jpg`

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw error

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

function pathFromUrl(url) {
  const marker = `/${BUCKET}/`
  const i = url.indexOf(marker)
  if (i === -1) return null
  return decodeURIComponent(url.slice(i + marker.length).split('?')[0])
}

export async function removeImage(url) {
  const path = pathFromUrl(url)
  if (path) await supabase.storage.from(BUCKET).remove([path])
}