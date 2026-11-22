import { useState } from 'react'
import { Check, KeyRound, Pencil, Plus, Settings2, Trash2 } from 'lucide-react'
import { getActiveProvider, useStudio } from '../store/useStudio'
import type { AIProvider } from '../types'
import { btnPrimary, panelCls } from '../ui/styles'
import { ProviderModal } from './ProviderModal'

const TYPE_BADGE: Record<AIProvider['type'], string> = {
  gemini: 'Gemini',
  'openai-compatible': 'OpenAI-compat',
  anthropic: 'Claude',
}

export function ProviderPanel() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AIProvider | 'new' | null>(null)

  const providers = useStudio((s) => s.providers)
  const activeProviderId = useStudio((s) => s.activeProviderId)
  const active = useStudio((s) => getActiveProvider(s))

  const addProvider = useStudio((s) => s.addProvider)
  const updateProvider = useStudio((s) => s.updateProvider)
  const removeProvider = useStudio((s) => s.removeProvider)
  const setActiveProvider = useStudio((s) => s.setActiveProvider)

  return (
    <div className={panelCls}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
        <span className="flex items-center gap-2.5">
          <span className={active.apiKey ? 'text-emerald-400' : 'text-amber-400'}>
            {active.apiKey ? <Check size={18} /> : <KeyRound size={18} />}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-fg">Provider AI Vision</span>
            <span className="block truncate text-[11px] text-dim">
              {active.name} · {active.model || 'model belum diisi'}
            </span>
          </span>
        </span>
        <Settings2 size={17} className={`shrink-0 text-dim transition ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="animate-in space-y-3 border-t border-line px-4 py-4">
          <div className="space-y-2">
            {providers.map((provider) => {
              const isActive = provider.id === activeProviderId
              return (
                <div
                  key={provider.id}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 transition ${
                    isActive ? 'border-violet-500/50 bg-violet-500/10' : 'border-line bg-inset'
                  }`}
                >
                  <button type="button" onClick={() => setActiveProvider(provider.id)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                    <span className={`grid size-4 shrink-0 place-items-center rounded-full border ${isActive ? 'border-violet-400 bg-violet-500' : 'border-dim/60'}`}>
                      {isActive && <Check size={10} className="text-fg-strong" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-fg">{provider.name}</span>
                      <span className="block truncate text-[10px] text-dim">
                        {TYPE_BADGE[provider.type]} · {provider.model || 'model kosong'}
                      </span>
                    </span>
                  </button>
                  <button type="button" onClick={() => setEditing(provider)} title="Edit" className="rounded-lg p-1.5 text-dim hover:bg-hover hover:text-violet-300">
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeProvider(provider.id)}
                    disabled={providers.length <= 1}
                    title="Hapus"
                    className="rounded-lg p-1.5 text-dim hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-30"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })}
          </div>

          <button type="button" className={`${btnPrimary} w-full`} onClick={() => setEditing('new')}>
            <Plus size={15} /> Tambah provider
          </button>

          <p className="text-[11px] leading-relaxed text-dim">
            Mendukung Gemini, OpenAI / OpenRouter / Groq, Anthropic Claude, dan penyedia OpenAI-compatible lain
            (CosmosAI, Pecutopus, dll). Semua key disimpan lokal di browser.
          </p>
        </div>
      )}

      {editing && (
        <ProviderModal
          provider={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={(provider) => {
            if (editing === 'new') addProvider(provider)
            else updateProvider(provider.id, provider)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
