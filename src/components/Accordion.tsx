import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { accentClasses, panelCls } from '../ui/styles'

interface Props {
  title: string
  subtitle?: string
  icon?: ReactNode
  tone?: string
  open: boolean
  onToggle: () => void
  badge?: string
  action?: ReactNode
  children: ReactNode
}

export function Accordion({ title, subtitle, icon, tone = 'violet', open, onToggle, badge, action, children }: Props) {
  const accent = accentClasses[tone] ?? accentClasses.violet
  return (
    <section className={panelCls}>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() } }}
        className="flex w-full cursor-pointer items-center justify-between gap-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {icon && <span className={`shrink-0 ${accent.text}`}>{icon}</span>}
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-fg">{title}</span>
            {subtitle && <span className="block truncate text-[11px] text-dim">{subtitle}</span>}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {badge && <span className="text-[10px] text-dim">{badge}</span>}
          {action && <span onClick={(e) => e.stopPropagation()}>{action}</span>}
          <ChevronDown size={17} className={`chev text-dim ${open ? 'is-open' : ''}`} />
        </span>
      </div>

      <div className={`acc-body ${open ? 'is-open' : ''}`}>
        <div><div className="pt-3">{children}</div></div>
      </div>
    </section>
  )
}
