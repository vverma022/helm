import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'

export const INSTALL_COMMAND = 'curl -fsSL https://helm.vverma.in/install.sh | sh'

type CopyState = 'idle' | 'copied' | 'failed'

export function InstallCommand({ className }: { className?: string }) {
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  async function copy() {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND)
      setState('copied')
    } catch {
      // Refused in an insecure context or by policy; the text stays selectable.
      setState('failed')
    }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), 2000)
  }

  return (
    <button
      type="button"
      onClick={() => {
        void copy()
      }}
      aria-label={`Copy install command: ${INSTALL_COMMAND}`}
      className={`group flex h-11 max-w-full items-center gap-3 overflow-hidden rounded-lg border border-border px-4 font-mono text-[13px] text-muted-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none ${className ?? ''}`}
    >
      <span className="text-brand/70 select-none">$</span>
      <span className="truncate text-foreground">{INSTALL_COMMAND}</span>
      {state === 'copied' ? (
        <Check className="size-3.5 shrink-0 text-brand" />
      ) : (
        <Copy className="size-3.5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />
      )}
      <span role="status" className="sr-only">
        {state === 'copied'
          ? 'Copied'
          : state === 'failed'
            ? 'Copy failed — select the command manually'
            : ''}
      </span>
    </button>
  )
}
