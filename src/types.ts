export type ProviderType = 'gemini' | 'openai-compatible' | 'anthropic'

export interface AIProvider {
  id: string
  name: string
  type: ProviderType
  apiKey: string
  baseUrl: string
  model: string
}

export type VariableType = 'text' | 'textarea' | 'select' | 'chips'

export interface Variable {
  key: string
  label: string
  type: VariableType
  placeholder?: string
  options?: string[]
  default?: string
  hint?: string
  required?: boolean
}

export interface PresetSettings {
  aspectRatio?: string
  duration?: string
  camera?: string
  motion?: string
}

export type PresetCategory = 'edit' | 'ecommerce' | 'kreatif' | 'interaktif'

export interface Preset {
  id: string
  name: string
  description: string
  icon: string
  category: PresetCategory
  accent: string
  basePrompt: string
  variables: Variable[]
  needsVision: boolean
  needsAnnotation: boolean
  negativePrompt?: string
  suggestedSettings?: PresetSettings
  builtIn?: boolean
}

export type MarkerType = 'box' | 'ellipse' | 'point'

export interface Marker {
  id: string
  type: MarkerType
  label: string
  /** Koordinat dinormalisasi 0..100 terhadap gambar */
  x: number
  y: number
  w: number
  h: number
}

export interface ImageAsset {
  name: string
  dataUrl: string
  width: number
  height: number
  mimeType: string
  size: number
}

export interface HistoryItem {
  id: string
  presetName: string
  prompt: string
  createdAt: number
}

export interface PromptSettings {
  aspectRatio: string
  duration: string
  camera: string
  motion: string
}
