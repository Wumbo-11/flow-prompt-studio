import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { uid } from '../lib/id'
import type { AIProvider, ProviderType } from '../types'
import { btnPrimary, inputCls, labelCls } from '../ui/styles'

interface Props {
  provider?: AIProvider
  onClose: () => void
  onSave: (provider: AIProvider) => void
}

const PRESETS: { name: string; type: ProviderType; baseUrl: string; model: string }[] = [
  { name: 'OpenAI', type: 'openai-compatible', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { name: 'OpenRouter', type: 'openai-compatible', baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini' },
  { name: 'Groq', type: 'openai-compatible', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  { name: 'Anthropic', type: 'anthropic', baseUrl: 'https://api.anthropic.com', model: 'claude-3-5-haiku-latest' },
  { name: 'Custom / CosmosAI', type: 'openai-compatible', baseUrl: '', model: '' },
]

const TYPE_LABELS: Record<ProviderType, string> = {
  gemini: 'Gemini (native)',
  'openai-compatible': 'OpenAI-compatible (GPT, OpenRouter, Groq, CosmosAI, dll)',
  anthropic: 'Anthropic Claude (native)',
}

export function ProviderModal({ provider, onClose, onSave }: Props) {
  const [name, setName] = useState(provider?.name ?? '')
  const [type, setType] = useState<ProviderType>(provider?.type ?? 'openai-compatible')
  const [baseUrl, setBaseUrl] = useState(provider?.baseUrl ?? '')
  const [apiKey, setApiKey] = useState(provider?.apiKey ?? '')
  const [model, setModel] = useState(provider?.model ?? '')
  const [error, setError] = useState('')

  const save = () => {
    if (!name.trim()) return setError('Nama provider wajib diisi.')
    if (!apiKey.trim()) return setError('API key wajib diisi.')
    if (!model.trim()) return setError('Nama model wajib diisi.')
    if (type !== 'gemini' && !baseUrl.trim()) return setError('Base URL wajib diisi untuk tipe ini.')
    onSave({
      id: provider?.id ?? `provider-${uid()}`,
      name: name.trim(),
      type,
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim(),
      model: model.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm" onClick={onClose}>
      <div
        className="animate-in flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h3 className="text-base font-semibold text-fg">{provider ? 'Edit provider' : 'Tambah provider AI'}</h3>
            <p className="text-[11px] text-dim">Dipakai buat membaca gambar jadi deskripsi prompt.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-dim hover:bg-hover hover:text-fg">
            <X size={17} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-dim">Pilih cepat</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => { setName(preset.name); setType(preset.type); setBaseUrl(preset.baseUrl); setModel(preset.model); setError('') }}
                  className="rounded-lg border border-line bg-hover px-2.5 py-1.5 text-[11px] font-medium text-fg-soft hover:border-violet-500/40 hover:text-violet-200"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="pv-name">Nama tampilan</label>
            <input id="pv-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: GPT-4o lewat OpenRouter" className={inputCls} />
          </div>

          <div>
            <label className={labelCls} htmlFor="pv-type">Tipe API</label>
            <select id="pv-type" value={type} onChange={(e) => setType(e.target.value as ProviderType)} className={inputCls}>
              {Object.entries(TYPE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>

          {type !== 'gemini' && (
            <div>
              <label className={labelCls} htmlFor="pv-base">Base URL</label>
              <input id="pv-base" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.openai.com/v1" className={`${inputCls} font-mono text-xs`} />
              <p className="mt-1 text-[10px] leading-relaxed text-dim">
                Untuk CosmosAI / Pecutopus / aggregator lain, paste base URL OpenAI-compatible mereka (biasanya diakhiri /v1).
              </p>
            </div>
          )}

          <div>
            <label className={labelCls} htmlFor="pv-key">API key</label>
            <input id="pv-key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." autoComplete="off" className={`${inputCls} font-mono text-xs`} />
          </div>

          <div>
            <label className={labelCls} htmlFor="pv-model">Model vision</label>
            <input
              id="pv-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={type === 'gemini' ? 'gemini-2.5-flash' : type === 'anthropic' ? 'claude-3-5-haiku-latest' : 'gpt-4o-mini'}
              className={`${inputCls} font-mono text-xs`}
            />
            <p className="mt-1 text-[10px] text-dim">Model harus mendukung input gambar.</p>
          </div>

          {error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</p>}
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-line px-4 py-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-line bg-hover px-4 py-2 text-sm text-fg-soft hover:bg-hover2">Batal</button>
          <button type="button" onClick={save} className={btnPrimary + ' !py-2'}>
            {provider ? <Check size={15} /> : <Plus size={15} />} {provider ? 'Simpan' : 'Tambah'}
          </button>
        </footer>
      </div>
    </div>
  )
}
