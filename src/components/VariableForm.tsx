import type { Variable } from '../types'
import { inputCls, labelCls } from '../ui/styles'

interface Props {
  variables: Variable[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
}

export function VariableForm({ variables, values, onChange }: Props) {
  if (variables.length === 0) {
    return <p className="text-xs text-dim">Preset ini nggak butuh input tambahan.</p>
  }

  return (
    <div className="space-y-3.5">
      {variables.map((variable) => {
        const value = values[variable.key] ?? variable.default ?? ''
        return (
          <div key={variable.key}>
            <label className={labelCls} htmlFor={`var-${variable.key}`}>
              {variable.label}
              {variable.required && <span className="ml-1 text-rose-400">*</span>}
            </label>

            {variable.type === 'textarea' && (
              <textarea
                id={`var-${variable.key}`}
                value={value}
                onChange={(e) => onChange(variable.key, e.target.value)}
                rows={3}
                placeholder={variable.placeholder}
                className={`${inputCls} resize-y`}
              />
            )}

            {variable.type === 'text' && (
              <input
                id={`var-${variable.key}`}
                value={value}
                onChange={(e) => onChange(variable.key, e.target.value)}
                placeholder={variable.placeholder}
                className={inputCls}
              />
            )}

            {variable.type === 'select' && (
              <select
                id={`var-${variable.key}`}
                value={value}
                onChange={(e) => onChange(variable.key, e.target.value)}
                className={inputCls}
              >
                {variable.options?.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}

            {variable.type === 'chips' && (
              <div className="flex flex-wrap gap-2">
                {variable.options?.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onChange(variable.key, value === option ? '' : option)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
                      value === option
                        ? 'border-violet-400/60 bg-violet-500/20 text-violet-100'
                        : 'border-line bg-hover text-muted hover:text-fg'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {variable.hint && <p className="mt-1 text-[11px] text-dim">{variable.hint}</p>}
          </div>
        )
      })}
    </div>
  )
}
