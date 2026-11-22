import { Moon, Sun } from 'lucide-react'
import { useStudio } from '../store/useStudio'

export function ThemeToggle() {
  const theme = useStudio((s) => s.theme)
  const toggleTheme = useStudio((s) => s.toggleTheme)
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Ganti ke tema gelap' : 'Ganti ke tema terang'}
      title={isLight ? 'Tema terang' : 'Tema gelap'}
      className="mx-auto grid size-10 place-items-center text-fg-strong transition-transform hover:scale-110 active:scale-95"
    >
      {isLight ? (
        <Sun key="sun" size={22} strokeWidth={1.8} className="theme-icon plop" />
      ) : (
        <Moon key="moon" size={22} strokeWidth={1.8} className="theme-icon plop" />
      )}
    </button>
  )
}
