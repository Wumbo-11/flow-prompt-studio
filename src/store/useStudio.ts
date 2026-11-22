import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AIProvider, HistoryItem, ImageAsset, Marker, Preset, PromptSettings } from '../types'

export const DEFAULT_SETTINGS: PromptSettings = {
  aspectRatio: '16:9',
  duration: '6s',
  camera: 'Slow push-in',
  motion: 'Subtle and natural',
}

const DEFAULT_PROVIDER: AIProvider = {
  id: 'gemini-default',
  name: 'Gemini (Google)',
  type: 'gemini',
  apiKey: '',
  baseUrl: '',
  model: 'gemini-2.5-flash',
}

interface StudioState {
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void

  /** Legacy: dipsimpan supaya state lama bisa dimigrasi. */
  apiKey: string
  setApiKey: (value: string) => void
  model: string
  setModel: (value: string) => void

  providers: AIProvider[]
  activeProviderId: string
  setActiveProvider: (id: string) => void
  addProvider: (provider: AIProvider) => void
  updateProvider: (id: string, patch: Partial<AIProvider>) => void
  removeProvider: (id: string) => void

  image: ImageAsset | null
  setImage: (value: ImageAsset | null) => void
  imageError: string
  setImageError: (value: string) => void

  description: string
  setDescription: (value: string) => void
  analyzing: boolean
  setAnalyzing: (value: boolean) => void
  visionError: string
  setVisionError: (value: string) => void

  selectedPresetId: string
  values: Record<string, string>
  pickPreset: (preset: Preset, applySettings?: boolean) => void
  setValue: (key: string, value: string) => void

  markers: Marker[]
  addMarker: (marker: Marker) => void
  updateMarker: (id: string, patch: Partial<Marker>) => void
  removeMarker: (id: string) => void
  clearMarkers: () => void

  customPresets: Preset[]
  addCustomPreset: (preset: Preset) => void
  removeCustomPreset: (id: string) => void

  settings: PromptSettings
  setSetting: (key: keyof PromptSettings, value: string) => void

  history: HistoryItem[]
  addHistory: (item: HistoryItem) => void
  removeHistory: (id: string) => void
  clearHistory: () => void

  finalPrompt: string
  setFinalPrompt: (value: string) => void
}

export const useStudio = create<StudioState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      apiKey: '',
      setApiKey: (value) => set({ apiKey: value }),
      model: 'gemini-2.5-flash',
      setModel: (value) => set({ model: value }),

      providers: [DEFAULT_PROVIDER],
      activeProviderId: DEFAULT_PROVIDER.id,
      setActiveProvider: (id) => set({ activeProviderId: id }),
      addProvider: (provider) => set((state) => ({ providers: [...state.providers, provider], activeProviderId: provider.id })),
      updateProvider: (id, patch) =>
        set((state) => ({ providers: state.providers.map((provider) => (provider.id === id ? { ...provider, ...patch } : provider)) })),
      removeProvider: (id) =>
        set((state) => {
          if (state.providers.length <= 1) return state
          const providers = state.providers.filter((provider) => provider.id !== id)
          return { providers, activeProviderId: state.activeProviderId === id ? providers[0].id : state.activeProviderId }
        }),

      image: null,
      setImage: (value) => set({ image: value }),
      imageError: '',
      setImageError: (value) => set({ imageError: value }),

      description: '',
      setDescription: (value) => set({ description: value }),
      analyzing: false,
      setAnalyzing: (value) => set({ analyzing: value }),
      visionError: '',
      setVisionError: (value) => set({ visionError: value }),

      selectedPresetId: 'image-to-video',
      values: {},
      pickPreset: (preset, applySettings = true) =>
        set((state) => ({
          selectedPresetId: preset.id,
          values: Object.fromEntries(preset.variables.map((variable) => [variable.key, variable.default ?? ''])),
          markers: [],
          settings: applySettings ? { ...DEFAULT_SETTINGS, ...preset.suggestedSettings } : state.settings,
        })),
      setValue: (key, value) => set((state) => ({ values: { ...state.values, [key]: value } })),

      markers: [],
      addMarker: (marker) => set((state) => ({ markers: [...state.markers, marker] })),
      updateMarker: (id, patch) =>
        set((state) => ({ markers: state.markers.map((marker) => (marker.id === id ? { ...marker, ...patch } : marker)) })),
      removeMarker: (id) => set((state) => ({ markers: state.markers.filter((marker) => marker.id !== id) })),
      clearMarkers: () => set({ markers: [] }),

      customPresets: [],
      addCustomPreset: (preset) => set((state) => ({ customPresets: [...state.customPresets, preset] })),
      removeCustomPreset: (id) => set((state) => ({ customPresets: state.customPresets.filter((preset) => preset.id !== id) })),

      settings: DEFAULT_SETTINGS,
      setSetting: (key, value) => set((state) => ({ settings: { ...state.settings, [key]: value } })),

      history: [],
      addHistory: (item) => set((state) => ({ history: [item, ...state.history].slice(0, 30) })),
      removeHistory: (id) => set((state) => ({ history: state.history.filter((item) => item.id !== id) })),
      clearHistory: () => set({ history: [] }),

      finalPrompt: '',
      setFinalPrompt: (value) => set({ finalPrompt: value }),
    }),
    {
      name: 'flow-prompt-studio',
      version: 1,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<StudioState>
        if (!state.providers?.length) {
          state.providers = [{ ...DEFAULT_PROVIDER, apiKey: state.apiKey ?? '', model: state.model ?? DEFAULT_PROVIDER.model }]
          state.activeProviderId = DEFAULT_PROVIDER.id
        }
        return state as StudioState
      },
      partialize: (state) => ({
        theme: state.theme,
        apiKey: state.apiKey,
        model: state.model,
        providers: state.providers,
        activeProviderId: state.activeProviderId,
        customPresets: state.customPresets,
        history: state.history,
        settings: state.settings,
      }),
    },
  ),
)

export function getActiveProvider(state: StudioState): AIProvider {
  return state.providers.find((provider) => provider.id === state.activeProviderId) ?? state.providers[0] ?? DEFAULT_PROVIDER
}
