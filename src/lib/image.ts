import type { ImageAsset } from '../types'

const MAX_DIMENSION = 1600

function loadBitmap(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; revoke?: () => void }> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file)
      .then((bitmap) => ({ source: bitmap, width: bitmap.width, height: bitmap.height, revoke: () => bitmap.close() }))
      .catch(() => loadViaImageElement(file))
  }
  return loadViaImageElement(file)
}

function loadViaImageElement(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; revoke?: () => void }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve({ source: img, width: img.naturalWidth, height: img.naturalHeight, revoke: () => URL.revokeObjectURL(url) })
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Gambar tidak bisa dibaca. Coba format JPG, PNG, atau WebP.'))
    }
    img.src = url
  })
}

/** Kompres gambar supaya aman dikirim ke Gemini Vision, tapi tetap oke buat ditampilkan. */
export async function fileToImageAsset(file: File): Promise<ImageAsset> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File bukan gambar. Pilih JPG, PNG, atau WebP.')
  }
  const loaded = await loadBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(loaded.width, loaded.height))
  const width = Math.max(1, Math.round(loaded.width * scale))
  const height = Math.max(1, Math.round(loaded.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Browser tidak mendukung canvas.')
  ctx.drawImage(loaded.source, 0, 0, width, height)
  loaded.revoke?.()

  const mimeType = file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg'
  const dataUrl = canvas.toDataURL(mimeType, 0.9)

  return {
    name: file.name,
    dataUrl,
    width,
    height,
    mimeType,
    size: Math.round((dataUrl.length * 3) / 4),
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
