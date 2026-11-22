import { useEffect, useMemo, useState } from 'react'
import { Check, Clipboard, Download, ExternalLink, FileText, History, RotateCw, Save, Settings2, Trash2 } from 'lucide-react'
import { BUILT_IN_PRESETS } from '../data/presets'
import { uid } from '../lib/id'
import { buildPrompt, copyToClipboard } from '../lib/prompt'
import { useStudio } from '../store/useStudio'
import { btnGhost, btnPrimary, inputCls, labelCls } from '../ui/styles'
import { Accordion } from './Accordion'

const ASPECTS = ['16:9', '9:16', '1:1', '4:5', '21:9']
const DURATIONS = ['4s', '6s', '8s', '10s']
const CAMERAS = ['Slow push-in', 'Gentle pull-back', 'Orbit / arc shot', 'Handheld follow', 'Low-angle tilt up', 'Static with parallax', 'Static']
const MOTIONS = ['Subtle and natural', 'Slow motion', 'Energy and fast cuts', 'Dreamy floating', 'Wind and fabric movement']

type Panel = 'prompt' | 'settings' | 'history'

export function StepPrompt() {
  const [touched, setTouched] = useState(false)
  const [copied, setCopied] = useState(false)
  const [notice, setNotice] = useState('')
  const [open, setOpen] = useState<Panel | null>('prompt')

  const image = useStudio((s) => s.image)
  const description = useStudio((s) => s.description)
  const markers = useStudio((s) => s.markers)
  const selectedPresetId = useStudio((s) => s.selectedPresetId)
  const values = useStudio((s) => s.values)
  const settings = useStudio((s) => s.settings)
  const setSetting = useStudio((s) => s.setSetting)
  const customPresets = useStudio((s) => s.customPresets)
  const finalPrompt = useStudio((s) => s.finalPrompt)
  const setFinalPrompt = useStudio((s) => s.setFinalPrompt)
  const history = useStudio((s) => s.history)
  const addHistory = useStudio((s) => s.addHistory)
  const removeHistory = useStudio((s) => s.removeHistory)
  const clearHistory = useStudio((s) => s.clearHistory)

  const preset = [...BUILT_IN_PRESETS, ...customPresets].find((item) => item.id === selectedPresetId) ?? BUILT_IN_PRESETS[0]

  const generated = useMemo(
    () => buildPrompt({ preset, values, description, markers, settings }),
    [preset, values, description, markers, settings],
  )

  useEffect(() => { setTouched(false) }, [selectedPresetId])
  useEffect(() => {
    if (!touched) setFinalPrompt(generated)
  }, [generated, touched, setFinalPrompt])

  const toggle = (panel: Panel) => setOpen((current) => (current === panel ? null : panel))

  const copy = async () => {
    try {
      await copyToClipboard(finalPrompt)
      setCopied(true)
      setNotice('Prompt tersalin. Tempel di Google Flow.')
      window.setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal menyalin.')
    }
  }

  const saveHistory = () => {
    if (!finalPrompt.trim()) return
    addHistory({ id: uid(), presetName: preset.name, prompt: finalPrompt, createdAt: Date.now() })
    setNotice('Prompt disimpan ke riwayat.')
  }

  const download = () => {
    const blob = new Blob([finalPrompt], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `flow-prompt-${preset.id}-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-2.5">
      <Accordion
        title="Prompt siap pakai"
        subtitle={`${preset.name} · ${finalPrompt.trim() ? finalPrompt.trim().split(/\s+/).length : 0} kata`}
        icon={<FileText size={16} />}
        tone="violet"
        open={open === 'prompt'}
        onToggle={() => toggle('prompt')}
        badge={touched ? 'Diedit' : 'Otomatis'}
        action={
          <button type="button" className={btnPrimary + ' !px-2.5 !py-1 !text-[11px]'} onClick={() => void copy()} disabled={!finalPrompt.trim()}>
            {copied ? <Check size={12} /> : <Clipboard size={12} />} {copied ? 'Oke' : 'Salin'}
          </button>
        }
      >
        <textarea
          value={finalPrompt}
          onChange={(e) => { setTouched(true); setFinalPrompt(e.target.value) }}
          rows={6}
          className={`${inputCls} resize-y font-mono text-[12px] leading-relaxed`}
          placeholder="Prompt akan muncul di sini setelah kamu mengisi langkah 1 & 2..."
        />
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-dim">
          <span>{finalPrompt.length} karakter</span>
          <span>{touched ? '✏️ diedit manual' : '✨ sinkron dengan preset'}</span>
        </div>

        {notice && <p className="mt-2 rounded-lg bg-violet-500/10 px-3 py-2 text-[11px] text-violet-200">{notice}</p>}

        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            className={btnGhost + ' !px-2 !py-1.5 !text-[11px]'}
            onClick={() => window.open('https://flow.google/', '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink size={13} /> Buka Flow
          </button>
          <button type="button" className={btnGhost + ' !px-2 !py-1.5 !text-[11px]'} onClick={saveHistory} disabled={!finalPrompt.trim()}>
            <Save size={13} /> Simpan
          </button>
          <button type="button" className={btnGhost + ' !px-2 !py-1.5 !text-[11px]'} onClick={download} disabled={!finalPrompt.trim()}>
            <Download size={13} /> Unduh .txt
          </button>
          {touched && (
            <button type="button" className={btnGhost + ' !px-2 !py-1.5 !text-[11px]'} onClick={() => { setTouched(false); setFinalPrompt(generated) }}>
              <RotateCw size={13} /> Reset
            </button>
          )}
        </div>
        {!image && (
          <p className="mt-2 text-[11px] text-amber-300/80">Belum ada gambar — deskripsi visualnya kosong.</p>
        )}
      </Accordion>

      <Accordion
        title="Pengaturan output"
        subtitle="Aspect ratio, durasi, kamera, gerakan"
        icon={<Settings2 size={16} />}
        tone="sky"
        open={open === 'settings'}
        onToggle={() => toggle('settings')}
      >
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="s-ratio">Aspect ratio</label>
            <select id="s-ratio" value={settings.aspectRatio} onChange={(e) => setSetting('aspectRatio', e.target.value)} className={inputCls}>
              {ASPECTS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="s-duration">Durasi</label>
            <select id="s-duration" value={settings.duration} onChange={(e) => setSetting('duration', e.target.value)} className={inputCls}>
              {DURATIONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="s-camera">Kamera</label>
            <select id="s-camera" value={settings.camera} onChange={(e) => setSetting('camera', e.target.value)} className={inputCls}>
              {Array.from(new Set([settings.camera, ...CAMERAS])).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="s-motion">Gerakan</label>
            <select id="s-motion" value={settings.motion} onChange={(e) => setSetting('motion', e.target.value)} className={inputCls}>
              {Array.from(new Set([settings.motion, ...MOTIONS])).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>
      </Accordion>

      {history.length > 0 && (
        <Accordion
          title="Riwayat prompt"
          subtitle={`${history.length} prompt tersimpan`}
          icon={<History size={16} />}
          tone="amber"
          open={open === 'history'}
          onToggle={() => toggle('history')}
          action={
            <button type="button" onClick={clearHistory} className="text-[11px] text-rose-300 hover:text-rose-200">Hapus semua</button>
          }
        >
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {history.map((item) => (
              <div key={item.id} className="flex items-start gap-2 rounded-xl border border-line bg-inset p-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-violet-300">
                    {item.presetName} <span className="font-normal text-faint">· {new Date(item.createdAt).toLocaleString('id-ID')}</span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{item.prompt}</p>
                </div>
                <button
                  type="button"
                  title="Pakai lagi"
                  onClick={() => { setTouched(true); setFinalPrompt(item.prompt); setNotice('Prompt dari riwayat dimuat.') }}
                  className="rounded-lg p-2 text-muted hover:bg-hover hover:text-violet-300"
                >
                  <RotateCw size={14} />
                </button>
                <button type="button" title="Hapus" onClick={() => removeHistory(item.id)} className="rounded-lg p-2 text-dim hover:bg-rose-500/10 hover:text-rose-300">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </Accordion>
      )}
    </div>
  )
}
