import type { Marker, Preset, PromptSettings } from '../types'

function regionName(x: number, y: number): string {
  const vertical = y < 33 ? 'upper' : y < 66 ? 'middle' : 'lower'
  const horizontal = x < 33 ? 'left' : x < 66 ? 'center' : 'right'
  return `${vertical}-${horizontal}`
}

function describeMarker(marker: Marker): string {
  const cx = Math.round(marker.x + marker.w / 2)
  const cy = Math.round(marker.y + marker.h / 2)
  const where = regionName(cx, cy)
  const label = marker.label.trim() || 'Object'

  if (marker.type === 'point') {
    return `- ${label}: single point at (${Math.round(marker.x)}%, ${Math.round(marker.y)}%) — ${where} of the frame`
  }
  const w = Math.max(1, Math.round(marker.w))
  const h = Math.max(1, Math.round(marker.h))
  const shape = marker.type === 'ellipse' ? 'ellipse' : 'rectangle'
  return `- ${label}: ${shape} centered at (${cx}%, ${cy}%), size ${w}% x ${h}% — ${where} of the frame`
}

export interface BuildPromptInput {
  preset: Preset
  values: Record<string, string>
  description: string
  markers: Marker[]
  settings: PromptSettings
}

export function buildPrompt({ preset, values, description, markers, settings }: BuildPromptInput): string {
  const markerText = markers.length
    ? markers.map(describeMarker).join('\n')
    : '(no manual markers)'

  let prompt = preset.basePrompt
    .replaceAll('{{IMAGE_DESCRIPTION}}', description.trim() || '(no image description available)')
    .replaceAll('{{MARKERS}}', markerText)

  for (const variable of preset.variables) {
    const value = values[variable.key] ?? variable.default ?? ''
    prompt = prompt.replaceAll(`{{${variable.key}}}`, value.trim())
  }

  prompt = prompt.replace(/\{\{[A-Z_]+\}\}/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

  const settingsLine = `[Output settings] Aspect ratio: ${settings.aspectRatio} | Duration: ${settings.duration} | Camera: ${settings.camera} | Motion: ${settings.motion}`
  const avoidLine = preset.negativePrompt ? `Avoid: ${preset.negativePrompt}.` : ''

  return [prompt, settingsLine, avoidLine].filter(Boolean).join('\n\n')
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(textarea)
  if (!ok) throw new Error('Gagal menyalin. Pilih teks manual lalu copy.')
}
