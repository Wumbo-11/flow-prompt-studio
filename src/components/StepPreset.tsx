import { useState } from 'react'
import { ImagePlus, Plus, Shapes, SlidersHorizontal, Trash2 } from 'lucide-react'
import { BUILT_IN_PRESETS, CATEGORY_LABELS } from '../data/presets'
import type { MarkerType, PresetCategory } from '../types'
import { useStudio } from '../store/useStudio'
import { accentClasses, btnGhost } from '../ui/styles'
import { Accordion } from './Accordion'
import { AnnotationCanvas } from './AnnotationCanvas'
import { PresetBuilderModal } from './PresetBuilderModal'
import { PresetIcon } from './PresetIcon'
import { VariableForm } from './VariableForm'

type Panel = 'list' | 'detail' | 'marker'

export function StepPreset() {
  const [category, setCategory] = useState<'semua' | PresetCategory>('semua')
  const [showBuilder, setShowBuilder] = useState(false)
  const [tool, setTool] = useState<MarkerType | null>(null)
  const [open, setOpen] = useState<Panel | null>('list')

  const customPresets = useStudio((s) => s.customPresets)
  const addCustomPreset = useStudio((s) => s.addCustomPreset)
  const removeCustomPreset = useStudio((s) => s.removeCustomPreset)
  const selectedPresetId = useStudio((s) => s.selectedPresetId)
  const pickPreset = useStudio((s) => s.pickPreset)
  const values = useStudio((s) => s.values)
  const setValue = useStudio((s) => s.setValue)
  const markers = useStudio((s) => s.markers)
  const addMarker = useStudio((s) => s.addMarker)
  const updateMarker = useStudio((s) => s.updateMarker)
  const removeMarker = useStudio((s) => s.removeMarker)
  const clearMarkers = useStudio((s) => s.clearMarkers)
  const image = useStudio((s) => s.image)

  const allPresets = [...BUILT_IN_PRESETS, ...customPresets]
  const selected = allPresets.find((preset) => preset.id === selectedPresetId) ?? BUILT_IN_PRESETS[0]
  const visible = category === 'semua' ? allPresets : allPresets.filter((preset) => preset.category === category)

  const toggle = (panel: Panel) => setOpen((current) => (current === panel ? null : panel))

  return (
    <div className="space-y-2.5">
      <Accordion
        title="Pilih preset"
        subtitle="Template prompt + input sendiri"
        icon={<Shapes size={16} />}
        tone="violet"
        open={open === 'list'}
        onToggle={() => toggle('list')}
        badge={`${allPresets.length} preset`}
        action={
          <button type="button" className={btnGhost + ' !px-2 !py-1 !text-[11px]'} onClick={() => setShowBuilder(true)}>
            <Plus size={12} /> Baru
          </button>
        }
      >
        <div className="mb-3 flex flex-wrap gap-1.5">
          {(['semua', ...Object.keys(CATEGORY_LABELS)] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key as 'semua' | PresetCategory)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                category === key
                  ? 'border-violet-400/60 bg-violet-500/20 text-violet-100'
                  : 'border-line bg-hover text-muted hover:text-fg'
              }`}
            >
              {key === 'semua' ? 'Semua' : CATEGORY_LABELS[key]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          {visible.map((preset) => {
            const style = accentClasses[preset.accent] ?? accentClasses.slate
            const active = preset.id === selected.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => { pickPreset(preset); setTool(null); setOpen('detail') }}
                className={`relative flex items-start gap-2 rounded-xl border p-2.5 text-left transition active:scale-[0.98] ${
                  active ? 'border-violet-500/60 bg-transparent' : 'border-line bg-transparent hover:border-line-strong hover:bg-hover'
                }`}
              >
                <span className={`shrink-0 ${style.text}`}>
                  <PresetIcon name={preset.icon} className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-fg">{preset.name}</span>
                  <span className="mt-0.5 line-clamp-2 block text-[10px] leading-snug text-dim">{preset.description}</span>
                </span>
                {active && <span className={`absolute right-2 top-2 size-1.5 rounded-full ${style.dot}`} />}
              </button>
            )
          })}
        </div>
      </Accordion>

      <Accordion
        title={selected.name}
        subtitle={selected.description}
        icon={<PresetIcon name={selected.icon} className="size-4" />}
        tone={selected.accent}
        open={open === 'detail'}
        onToggle={() => toggle('detail')}
        badge={selected.needsAnnotation ? 'Penanda' : 'Input'}
        action={!selected.builtIn ? (
          <button
            type="button"
            title="Hapus preset"
            onClick={() => { removeCustomPreset(selected.id); pickPreset(BUILT_IN_PRESETS[0]) }}
            className="rounded-lg p-1.5 text-rose-300 hover:bg-rose-500/10"
          >
            <Trash2 size={13} />
          </button>
        ) : undefined}
      >
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-hover px-2 py-0.5 text-[10px] text-muted">Vision otomatis</span>
          {selected.needsAnnotation && <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-300">Butuh penanda</span>}
        </div>
        <VariableForm variables={selected.variables} values={values} onChange={setValue} />
        {selected.needsAnnotation && (
          <button type="button" onClick={() => setOpen('marker')} className={btnGhost + ' mt-3 w-full !text-xs'}>
            <SlidersHorizontal size={13} /> Buka kanvas penanda →
          </button>
        )}
      </Accordion>

      {selected.needsAnnotation && (
        <Accordion
          title="Penanda objek"
          subtitle="Tandai area yang mau dihapus"
          icon={<ImagePlus size={16} />}
          tone="rose"
          open={open === 'marker'}
          onToggle={() => toggle('marker')}
          badge={markers.length ? `${markers.length} penanda` : undefined}
        >
          {image ? (
            <AnnotationCanvas
              image={image}
              markers={markers}
              tool={tool}
              onToolChange={setTool}
              onAdd={addMarker}
              onUpdate={updateMarker}
              onRemove={removeMarker}
              onClear={clearMarkers}
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-line py-8 text-center">
              <ImagePlus size={20} className="text-faint" />
              <p className="text-xs text-dim">Upload gambar dulu di langkah 1.</p>
            </div>
          )}
        </Accordion>
      )}

      {showBuilder && <PresetBuilderModal onClose={() => setShowBuilder(false)} onSave={(preset) => { addCustomPreset(preset); pickPreset(preset); setShowBuilder(false); setTool(null); setOpen('detail') }} />}
    </div>
  )
}
