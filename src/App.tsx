import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { ProviderPanel } from './components/ProviderPanel'
import { StepImage } from './components/StepImage'
import { StepPreset } from './components/StepPreset'
import { StepPrompt } from './components/StepPrompt'
import { ThemeToggle } from './components/ThemeToggle'
import { BUILT_IN_PRESETS } from './data/presets'
import { useStudio } from './store/useStudio'
import { btnGhost, btnPrimary } from './ui/styles'

const STEPS = [
  { title: 'Gambar' },
  { title: 'Preset' },
  { title: 'Prompt' },
]

export default function App() {
  const [step, setStep] = useState(0)
  const theme = useStudio((s) => s.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const state = useStudio.getState()
    const all = [...BUILT_IN_PRESETS, ...state.customPresets]
    const current = all.find((preset) => preset.id === state.selectedPresetId) ?? BUILT_IN_PRESETS[0]
    state.pickPreset(current, false)
  }, [])

  return (
    <div className="app-shell min-h-screen bg-app">
      <div className="mx-auto w-full max-w-5xl px-4 pb-6 pt-4 sm:px-6 sm:pt-6">
        <header className="mb-4">
          <div className="flex flex-col items-center text-center">
            <Sparkles size={22} className="text-violet-400" />
            <h1 className="mt-1.5 text-lg font-semibold tracking-wide text-fg-strong">Flow Prompt Studio</h1>
            <p className="text-[10px] text-dim">Gambar → prompt video Google Flow</p>
          </div>

          <div className="mt-4">
            <ProviderPanel />
          </div>
        </header>

        <nav className="mb-3 grid grid-cols-3 gap-2" aria-label="Langkah">
          {STEPS.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setStep(index)}
              className={`rounded-xl border px-2 py-2 text-center transition ${
                step === index ? 'border-line-strong bg-surface' : 'border-line bg-transparent hover:bg-hover'
              }`}
            >
              <span className={`text-xs font-semibold ${step === index ? 'text-violet-300' : 'text-dim'}`}>
                {index + 1}. {item.title}
              </span>
            </button>
          ))}
        </nav>

        <main className="animate-in" key={step}>
          {step === 0 && <StepImage />}
          {step === 1 && <StepPreset />}
          {step === 2 && <StepPrompt />}
        </main>

        <div className="mt-3 flex items-center justify-between gap-3">
          <button type="button" className={btnGhost + ' !py-2'} onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft size={14} /> Kembali
          </button>
          {step < 2 && (
            <button type="button" className={btnPrimary + ' !py-2'} onClick={() => setStep((s) => Math.min(2, s + 1))}>
              {step === 0 ? 'Ke preset' : 'Buat prompt'} <ArrowRight size={14} />
            </button>
          )}
        </div>

        <footer className="mt-5 border-t border-line pt-3 text-center text-[10px] leading-relaxed text-faint">
          <p>Prompt ditujukan untuk Google Flow (Veo). Generate video tetap dilakukan di Flow.</p>
          <div className="mt-3">
            <ThemeToggle />
          </div>
        </footer>
      </div>
    </div>
  )
}
