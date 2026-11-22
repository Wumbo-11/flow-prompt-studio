export const inputCls =
  'w-full rounded-xl border border-line bg-inset px-3 py-2 text-sm text-fg placeholder:text-faint outline-none transition focus:border-violet-500/70'

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40'

export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-hover px-3.5 py-2 text-sm font-medium text-fg-soft transition hover:bg-hover2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40'

export const btnDanger =
  'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 active:scale-[0.98]'

export const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted'

export const panelCls = 'rounded-2xl border border-line-strong bg-surface p-3.5 sm:p-4'

export const chipCls =
  'rounded-lg border px-3 py-1.5 text-xs font-medium transition active:scale-[0.97]'

export const accentClasses: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  violet: { bg: 'bg-violet-500/15', text: 'text-violet-300', border: 'border-violet-500/30', dot: 'bg-violet-400' },
  sky: { bg: 'bg-sky-500/15', text: 'text-sky-300', border: 'border-sky-500/30', dot: 'bg-sky-400' },
  orange: { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  rose: { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30', dot: 'bg-rose-400' },
  fuchsia: { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-300', border: 'border-fuchsia-500/30', dot: 'bg-fuchsia-400' },
  emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  amber: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  cyan: { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30', dot: 'bg-cyan-400' },
  slate: { bg: 'bg-hover2', text: 'text-fg-soft', border: 'border-line', dot: 'bg-dim' },
}
