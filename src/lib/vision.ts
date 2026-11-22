import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider, ImageAsset } from '../types'

export const VISION_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (default, teliti)' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (hemat)' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (legacy)' },
]

const DESCRIPTION_INSTRUCTION = `You are a visual describer for an AI video generation prompt (Google Flow / Veo).
Describe this image precisely and objectively in English, in one compact paragraph of 4-7 sentences.
Include: main subject and exact appearance, clothing/objects, composition and framing, camera angle,
background and environment, lighting and color palette, visible text or logos, and material/texture details.
Only state what is actually visible. Do not invent, do not add story, do not mention "the image shows".
Output plain text only, no bullets, no headings, no quotes.`

function base64Of(image: ImageAsset) {
  const base64 = image.dataUrl.split(',')[1]
  if (!base64) throw new Error('Data gambar tidak valid.')
  return base64
}

async function describeWithGemini(provider: AIProvider, image: ImageAsset): Promise<string> {
  const genAI = new GoogleGenerativeAI(provider.apiKey.trim())
  const model = genAI.getGenerativeModel({ model: provider.model.trim() || 'gemini-2.5-flash' })
  const result = await model.generateContent([
    { text: DESCRIPTION_INSTRUCTION },
    { inlineData: { data: base64Of(image), mimeType: image.mimeType } },
  ])
  return result.response.text().trim().replace(/\s+/g, ' ')
}

function openAIEndpoint(baseUrl: string): string {
  const base = baseUrl.trim().replace(/\/+$/, '')
  if (!base) throw new Error('Base URL belum diisi. Contoh: https://api.openai.com/v1')
  return base.endsWith('/chat/completions') ? base : `${base}/chat/completions`
}

async function describeOpenAICompatible(provider: AIProvider, image: ImageAsset): Promise<string> {
  const url = openAIEndpoint(provider.baseUrl)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: provider.model.trim(),
      temperature: 0.2,
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: DESCRIPTION_INSTRUCTION },
            { type: 'image_url', image_url: { url: `data:${image.mimeType};base64,${base64Of(image)}` } },
          ],
        },
      ],
    }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`)
  const data = await response.json() as { choices?: { message?: { content?: string | { text?: string }[] } }[]; error?: { message?: string } }
  const content = data.choices?.[0]?.message?.content
  const text = typeof content === 'string'
    ? content
    : Array.isArray(content)
      ? content.map((part) => part.text ?? '').join(' ')
      : data.error?.message ?? ''
  return text.trim().replace(/\s+/g, ' ')
}

function anthropicEndpoint(baseUrl: string): string {
  const base = baseUrl.trim().replace(/\/+$/, '')
  if (!base) throw new Error('Base URL belum diisi. Contoh: https://api.anthropic.com')
  return base.endsWith('/v1') ? `${base}/messages` : `${base}/v1/messages`
}

async function describeAnthropic(provider: AIProvider, image: ImageAsset): Promise<string> {
  const response = await fetch(anthropicEndpoint(provider.baseUrl), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey.trim(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: provider.model.trim(),
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: image.mimeType, data: base64Of(image) } },
            { type: 'text', text: DESCRIPTION_INSTRUCTION },
          ],
        },
      ],
    }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`)
  const data = await response.json() as { content?: { type?: string; text?: string }[]; error?: { message?: string } }
  const text = (data.content ?? []).filter((part) => part.type === 'text').map((part) => part.text ?? '').join(' ')
  return (text || data.error?.message || '').trim().replace(/\s+/g, ' ')
}

/** Panggil provider vision aktif. Semua provider menghasilkan deskripsi gambar yang sama. */
export async function describeImage(provider: AIProvider, image: ImageAsset): Promise<string> {
  if (!provider.apiKey.trim()) throw new Error('API key belum diisi di pengaturan provider.')
  if (!provider.model.trim()) throw new Error('Model belum diisi di pengaturan provider.')

  let text: string
  switch (provider.type) {
    case 'gemini':
      text = await describeWithGemini(provider, image)
      break
    case 'openai-compatible':
      text = await describeOpenAICompatible(provider, image)
      break
    case 'anthropic':
      text = await describeAnthropic(provider, image)
      break
  }
  if (!text) throw new Error('Model tidak mengembalikan deskripsi. Coba model lain.')
  return text
}

export function friendlyVisionError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  if (/API key not valid|API_KEY_INVALID|invalid api key|invalid_api_key|authentication|unauthorized|401|403/i.test(message)) {
    return 'API key tidak valid / tidak punya akses. Cek key & model di pengaturan provider.'
  }
  if (/quota|rate limit|RESOURCE_EXHAUSTED|429/i.test(message)) return 'Kuota / rate limit habis. Coba lagi nanti atau ganti provider.'
  if (/not found|404|model.*does not exist/i.test(message)) return 'Model tidak ditemukan. Cek nama model di pengaturan provider.'
  if (/fetch|network|failed to fetch|ECONN/i.test(message)) return 'Gagal terhubung ke provider. Cek koneksi & base URL.'
  if (/HTTP 5\d\d/i.test(message)) return 'Server provider sedang error. Coba lagi sebentar.'
  return message || 'Terjadi kesalahan saat menganalisis gambar.'
}
