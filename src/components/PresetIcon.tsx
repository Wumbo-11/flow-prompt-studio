import {
  Columns2,
  Eraser,
  FileText,
  MousePointer2,
  RotateCw,
  Scissors,
  Shapes,
  ShoppingBag,
  Sparkles,
  Type,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Eraser,
  ShoppingBag,
  Scissors,
  MousePointer2,
  RotateCw,
  Type,
  Columns2,
  FileText,
  Shapes,
}

export function PresetIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Sparkles
  return <Icon className={className} />
}
