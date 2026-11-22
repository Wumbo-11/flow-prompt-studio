import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { CATEGORY_LABELS } from '../data/presets'
import type { Preset, PresetCategory, Variable } from '../types'
import { uid } from '../lib/id'
import { btnPrimary, inputCls, labelCls } from '../ui/styles'

interface Props {
  onClose: () => void
  onSave: (preset: Preset) => void
}

const ICON_CHOICES = ['Shapes', 'Sparkles', 'Wand2', 'Focus', 'Layers', 'Box', 'Zap', 'Play']
const ACCENTS = ['violet', 'sky', 'orange', 'rose', 'fuchsia', 'emerald', 'amber', 'cyan', 'slate']

export function PresetBuilderModal({ onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<PresetCategory>('kreatif')
  const [icon, setIcon] = useState('Shapes')
  const [accent, setAccent] = useState('violet')
  const [basePrompt, setBasePrompt] = useState('Use the reference image: {{IMAGE_DESCRIPTION}}\n\nInstruction: ')
  const [needsAnnotation, setNeedsAnnotation] = useState(false)
  const [error, setError] = useState('')

  const detectedKeys = Array.from(
    new Set(
      Array.from(basePrompt.matchAll(/\{\{([a-z][a-z0-9_]*)\}\}/g))
        .map((match) => match[1])
        .filter((key) => !['image_description', 'markers'].includes(key)),
    ),
  )

  const save = () => {
    if (!name.trim()) return setError('Nama preset wajib diisi.')
    if (!basePrompt.trim()) return setError('Template prompt kosong.')
    const variables: Variable[] = detectedKeys.map((key) => ({
      key,
      label: key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()),
      type: 'text',
      placeholder: `Isi ${key}...`,
    }))
    onSave({
      id: `custom-${uid()}`,
      name: name.trim(),
      description: description.trim() || 'Preset buatan kamu.',
      icon,
      category,
      accent,
      basePrompt,
      variables,
      needsVision: true,
      needsAnnotation,
      builtIn: false,
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
            <h3 className="text-base font-semibold text-fg">Buat preset sendiri</h3>
            <p className="text-[11px] leading-relaxed text-dim">
              Placeholder: <code className="text-violet-300">{'{{IMAGE_DESCRIPTION}}'}</code>,{' '}
              <code className="text-violet-300">{'{{MARKERS}}'}</code>, variabel huruf kecil mis.{' '}
              <code className="text-violet-300">{'{{judul}}'}</code>
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-dim hover:bg-hover hover:text-fg">
            <X size={17} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="p-name">Nama preset</label>
              <input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Flat Lay Produk" className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="p-cat">Kategori</label>
              <select id="p-cat" value={category} onChange={(e) => setCategory(e.target.value as PresetCategory)} className={inputCls}>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="p-desc">Deskripsi singkat</label>
            <input id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Kapan preset ini dipakai?" className={inputCls} />
          </div>

          <div>
            <label className={labelCls} htmlFor="p-prompt">Template prompt</label>
            <textarea id="p-prompt" value={basePrompt} onChange={(e) => setBasePrompt(e.target.value)} rows={6} className={`${inputCls} resize-y font-mono text-xs leading-relaxed`} />
            {detectedKeys.length > 0 && (
              <p className="mt-1 text-[11px] text-emerald-400">Variabel terdeteksi: {detectedKeys.join(', ')}</p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="p-icon">Ikon</label>
              <select id="p-icon" value={icon} onChange={(e) => setIcon(e.target.value)} className={inputCls}>
                {ICON_CHOICES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="p-accent">Warna</label>
              <select id="p-accent" value={accent} onChange={(e) => setAccent(e.target.value)} className={inputCls}>
                {ACCENTS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-inset px-3 py-2.5">
            <input type="checkbox" checked={needsAnnotation} onChange={(e) => setNeedsAnnotation(e.target.checked)} className="size-4 accent-violet-500" />
            <span className="text-xs text-fg-soft">Tampilkan kanvas penanda objek untuk preset ini</span>
          </label>

          {error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</p>}
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-line px-4 py-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-line bg-hover px-4 py-2 text-sm text-fg-soft hover:bg-hover2">Batal</button>
          <button type="button" onClick={save} className={btnPrimary + ' !py-2'}><Plus size={15} /> Simpan preset</button>
        </footer>
      </div>
    </div>
  )
}
