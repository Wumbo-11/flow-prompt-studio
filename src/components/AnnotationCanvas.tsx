import { useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { Check, Circle, Dot, Square, Trash2 } from 'lucide-react'
import type { Marker, MarkerType } from '../types'
import type { ImageAsset } from '../types'
import { uid } from '../lib/id'
import { btnGhost, inputCls } from '../ui/styles'

const COLORS = ['#a78bfa', '#fb7185', '#fbbf24', '#34d399', '#38bdf8', '#f472b6']

interface Props {
  image: ImageAsset
  markers: Marker[]
  tool: MarkerType | null
  onToolChange: (tool: MarkerType | null) => void
  onAdd: (marker: Marker) => void
  onUpdate: (id: string, patch: Partial<Marker>) => void
  onRemove: (id: string) => void
  onClear: () => void
}

interface Draft {
  x: number
  y: number
  w: number
  h: number
}

export function AnnotationCanvas({ image, markers, tool, onToolChange, onAdd, onUpdate, onRemove, onClear }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const toPercent = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect()
    const clamp = (v: number) => Math.max(0, Math.min(100, v))
    return {
      x: clamp(((clientX - rect.left) / rect.width) * 100),
      y: clamp(((clientY - rect.top) / rect.height) * 100),
    }
  }

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!tool) return
    const point = toPercent(event.clientX, event.clientY)
    startRef.current = point

    if (tool === 'point') {
      onAdd({
        id: uid(),
        type: 'point',
        label: `Objek ${markers.length + 1}`,
        x: point.x,
        y: point.y,
        w: 0,
        h: 0,
      })
      return
    }

    svgRef.current?.setPointerCapture(event.pointerId)
    setDraft({ x: point.x, y: point.y, w: 0, h: 0 })
  }

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!tool || tool === 'point' || !startRef.current) return
    const point = toPercent(event.clientX, event.clientY)
    const start = startRef.current
    setDraft({
      x: Math.min(start.x, point.x),
      y: Math.min(start.y, point.y),
      w: Math.abs(point.x - start.x),
      h: Math.abs(point.y - start.y),
    })
  }

  const handlePointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!tool || !startRef.current) return
    svgRef.current?.releasePointerCapture(event.pointerId)
    if (draft && draft.w > 1.5 && draft.h > 1.5) {
      onAdd({
        id: uid(),
        type: tool,
        label: `Objek ${markers.length + 1}`,
        x: draft.x,
        y: draft.y,
        w: draft.w,
        h: draft.h,
      })
    }
    startRef.current = null
    setDraft(null)
  }

  const tools: { id: MarkerType; label: string; icon: typeof Square }[] = [
    { id: 'box', label: 'Kotak', icon: Square },
    { id: 'ellipse', label: 'Elips', icon: Circle },
    { id: 'point', label: 'Titik', icon: Dot },
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {tools.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onToolChange(tool === id ? null : id)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
              tool === id
                ? 'border-violet-400/60 bg-violet-500/20 text-violet-200'
                : 'border-line bg-hover text-muted hover:text-fg'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
        <button type="button" onClick={() => onToolChange(null)} className={btnGhost + ' !px-3 !py-1.5'}>
          <Check size={14} /> Selesai
        </button>
        {markers.length > 0 && (
          <button type="button" onClick={onClear} className="ml-auto inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-200">
            <Trash2 size={13} /> Hapus semua
          </button>
        )}
      </div>

      <p className="text-[11px] text-dim">
        {tool
          ? `Mode ${tool}: ${tool === 'point' ? 'tap' : 'geser'} di atas gambar untuk menandai objek.`
          : 'Pilih alat lalu tandai area yang ingin dihapus. Ketuk penanda untuk memilihnya.'}
      </p>

      <div className="relative overflow-hidden rounded-xl border border-line bg-surface">
        <img src={image.dataUrl} alt="Area penanda" className="block w-full select-none" draggable={false} />
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          style={{ touchAction: 'none', cursor: tool ? 'crosshair' : 'default' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {markers.map((marker, index) => {
            const color = COLORS[index % COLORS.length]
            const active = selectedId === marker.id
            const common = {
              fill: `${color}22`,
              stroke: color,
              strokeWidth: active ? 3.5 : 2,
              vectorEffect: 'non-scaling-stroke' as const,
              pointerEvents: (tool ? 'none' : 'auto') as CSSProperties['pointerEvents'],
              onPointerDown: (event: ReactPointerEvent<SVGElement>) => {
                event.stopPropagation()
                setSelectedId(marker.id)
              },
            }
            if (marker.type === 'point') {
              return <circle key={marker.id} cx={marker.x} cy={marker.y} r={1.4} {...common} />
            }
            if (marker.type === 'ellipse') {
              return (
                <ellipse
                  key={marker.id}
                  cx={marker.x + marker.w / 2}
                  cy={marker.y + marker.h / 2}
                  rx={marker.w / 2}
                  ry={marker.h / 2}
                  {...common}
                />
              )
            }
            return <rect key={marker.id} x={marker.x} y={marker.y} width={marker.w} height={marker.h} rx={0.6} {...common} />
          })}

          {draft && (
            <rect
              x={draft.x}
              y={draft.y}
              width={draft.w}
              height={draft.h}
              fill="rgba(167,139,250,0.12)"
              stroke="#c4b5fd"
              strokeWidth={2}
              strokeDasharray="4 3"
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
            />
          )}
        </svg>

        {markers.map((marker, index) => {
          const color = COLORS[index % COLORS.length]
          const left = marker.type === 'point' ? marker.x : marker.x
          const top = marker.type === 'point' ? marker.y : marker.y
          return (
            <span
              key={marker.id}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md px-1.5 py-0.5 text-[9px] font-bold text-slate-950"
              style={{ left: `${left}%`, top: `${top}%`, background: color }}
            >
              {marker.label}
            </span>
          )
        })}
      </div>

      {markers.length > 0 && (
        <div className="space-y-2">
          {markers.map((marker, index) => (
            <div
              key={marker.id}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 transition ${
                selectedId === marker.id ? 'border-violet-500/50 bg-violet-500/10' : 'border-line bg-inset'
              }`}
              onClick={() => setSelectedId(marker.id)}
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
              <input
                value={marker.label}
                onChange={(e) => onUpdate(marker.id, { label: e.target.value })}
                className={`${inputCls} !py-1.5 !text-xs`}
                aria-label={`Nama penanda ${index + 1}`}
              />
              <span className="shrink-0 text-[10px] uppercase text-dim">{marker.type}</span>
              <button type="button" onClick={() => onRemove(marker.id)} className="shrink-0 rounded-lg p-1.5 text-dim hover:bg-rose-500/10 hover:text-rose-300">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
