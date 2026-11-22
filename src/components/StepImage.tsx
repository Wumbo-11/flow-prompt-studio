import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, Check, FileText, ImagePlus, Loader2, ScanEye, Trash2, Upload } from 'lucide-react'
import { fileToImageAsset, formatBytes } from '../lib/image'
import { describeImage, friendlyVisionError } from '../lib/vision'
import { getActiveProvider, useStudio } from '../store/useStudio'
import { btnGhost, btnPrimary, inputCls } from '../ui/styles'
import { Accordion } from './Accordion'

export function StepImage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loadingImage, setLoadingImage] = useState(false)
  const [open, setOpen] = useState<'image' | 'description' | null>('image')

  const image = useStudio((s) => s.image)
  const setImage = useStudio((s) => s.setImage)
  const imageError = useStudio((s) => s.imageError)
  const setImageError = useStudio((s) => s.setImageError)
  const description = useStudio((s) => s.description)
  const setDescription = useStudio((s) => s.setDescription)
  const analyzing = useStudio((s) => s.analyzing)
  const setAnalyzing = useStudio((s) => s.setAnalyzing)
  const visionError = useStudio((s) => s.visionError)
  const setVisionError = useStudio((s) => s.setVisionError)
  const active = useStudio((s) => getActiveProvider(s))
  const clearMarkers = useStudio((s) => s.clearMarkers)

  const handleFile = useCallback(
    async (file?: File | null) => {
      if (!file) return
      setImageError('')
      setVisionError('')
      setLoadingImage(true)
      try {
        const asset = await fileToImageAsset(file)
        setImage(asset)
        setDescription('')
        clearMarkers()
        setOpen('image')
      } catch (error) {
        setImageError(error instanceof Error ? error.message : 'Gagal memuat gambar.')
      } finally {
        setLoadingImage(false)
      }
    },
    [clearMarkers, setDescription, setImage, setImageError, setVisionError],
  )

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const item = Array.from(event.clipboardData?.items ?? []).find((entry) => entry.type.startsWith('image/'))
      const file = item?.getAsFile()
      if (file) {
        event.preventDefault()
        void handleFile(file)
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [handleFile])

  const analyze = async () => {
    if (!image) return
    if (!active.apiKey.trim()) {
      setVisionError('Isi API key provider aktif dulu lewat panel "Provider AI Vision" di atas.')
      return
    }
    setAnalyzing(true)
    setVisionError('')
    try {
      const result = await describeImage(active, image)
      setDescription(result)
      setOpen('description')
    } catch (error) {
      setVisionError(friendlyVisionError(error))
    } finally {
      setAnalyzing(false)
    }
  }

  const toggle = (key: 'image' | 'description') => setOpen((current) => (current === key ? null : key))

  return (
    <div className="space-y-2.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/*"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      <Accordion
        title="1. Gambar referensi"
        subtitle="Upload, drag, atau paste gambar"
        icon={<ImagePlus size={16} />}
        tone="violet"
        open={open === 'image'}
        onToggle={() => toggle('image')}
        badge={image ? `${image.width}×${image.height}` : undefined}
      >
        {!image ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              void handleFile(e.dataTransfer.files?.[0])
            }}
            className={`flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center transition ${
              dragging ? 'border-violet-400 bg-violet-500/10' : 'border-line-strong bg-inset hover:border-violet-500/50'
            }`}
          >
            <span className="text-violet-400">
              {loadingImage ? <Loader2 size={22} className="animate-spin" /> : <ImagePlus size={22} />}
            </span>
            <span className="text-sm font-semibold text-fg">Taruh gambar di sini</span>
            <span className="text-[11px] text-dim">klik pilih file · JPG, PNG, WebP · atau Ctrl+V</span>
          </button>
        ) : (
          <div className="space-y-2.5">
            <div className="overflow-hidden rounded-xl border border-line bg-surface">
              <img src={image.dataUrl} alt="Gambar referensi" className="mx-auto block max-h-[38vh] w-full object-contain" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="max-w-[55%] truncate text-[11px] text-dim" title={image.name}>{image.name} · {formatBytes(image.size)}</p>
              <div className="flex gap-1.5">
                <button type="button" className={btnGhost + ' !px-2.5 !py-1.5 !text-xs'} onClick={() => inputRef.current?.click()}>
                  <Upload size={13} /> Ganti
                </button>
                <button type="button" className={btnGhost + ' !px-2.5 !py-1.5 !text-xs'} onClick={() => { setImage(null); setDescription(''); clearMarkers() }}>
                  <Trash2 size={13} /> Hapus
                </button>
              </div>
            </div>
          </div>
        )}
        {imageError && (
          <p className="mt-2 flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            <AlertCircle size={14} /> {imageError}
          </p>
        )}
      </Accordion>

      <Accordion
        title="2. Deskripsi gambar"
        subtitle={`Hasil ${active.name} — bisa diedit`}
        icon={<FileText size={16} />}
        tone="sky"
        open={open === 'description'}
        onToggle={() => toggle('description')}
        badge={description ? 'Siap' : undefined}
      >
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-dim">Dipakai otomatis oleh semua preset.</p>
          <button type="button" className={btnPrimary + ' !px-3 !py-1.5 !text-xs'} onClick={() => void analyze()} disabled={!image || analyzing}>
            {analyzing ? <Loader2 size={13} className="animate-spin" /> : <ScanEye size={13} />}
            {analyzing ? 'Menganalisis...' : description ? 'Analisis ulang' : 'Analisis AI'}
          </button>
        </div>

        <div className="relative">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${inputCls} resize-y leading-relaxed`}
            placeholder="Upload gambar lalu klik Analisis AI, atau tulis manual di sini..."
          />
          {description && (
            <span className="absolute bottom-2 right-3 flex items-center gap-1 text-[10px] text-emerald-400">
              <Check size={11} /> siap
            </span>
          )}
        </div>

        {visionError && (
          <p className="mt-2 flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            <AlertCircle size={14} /> {visionError}
          </p>
        )}
        {!active.apiKey && (
          <p className="mt-2 text-[11px] text-dim">Tanpa API key tetap bisa pakai preset dengan deskripsi manual.</p>
        )}
      </Accordion>
    </div>
  )
}
