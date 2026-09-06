import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'dark' | 'light'

/** Dark is the default; the stored choice is the only thing that overrides it.
 *  The initial class is set by an inline script in __root so there is no flash,
 *  and this only has to stay in step with it. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    )
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.documentElement.style.colorScheme = next
    try {
      localStorage.setItem('helm-theme', next)
    } catch {
      // Private windows can refuse storage; the toggle still works this session.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      {theme === 'dark' ? (
        <Sun className="size-[18px]" />
      ) : (
        <Moon className="size-[18px]" />
      )}
    </button>
  )
}
