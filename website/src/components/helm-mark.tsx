/** The Helm mark: a ship's wheel, computed geometry on a 512 grid.
 *  Ink is currentColor so one component serves both themes; `brandHub` paints
 *  the centre with the brand colour where the mark is shown large. */
export function HelmMark({
  className,
  brandHub = false,
}: {
  className?: string
  brandHub?: boolean
}) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
    >
      <line x1="256.00" y1="118.00" x2="256.00" y2="60.00" strokeWidth={18} strokeLinecap="round" />
      <line x1="353.58" y1="158.42" x2="394.59" y2="117.41" strokeWidth={18} strokeLinecap="round" />
      <line x1="394.00" y1="256.00" x2="452.00" y2="256.00" strokeWidth={18} strokeLinecap="round" />
      <line x1="353.58" y1="353.58" x2="394.59" y2="394.59" strokeWidth={18} strokeLinecap="round" />
      <line x1="256.00" y1="394.00" x2="256.00" y2="452.00" strokeWidth={18} strokeLinecap="round" />
      <line x1="158.42" y1="353.58" x2="117.41" y2="394.59" strokeWidth={18} strokeLinecap="round" />
      <line x1="118.00" y1="256.00" x2="60.00" y2="256.00" strokeWidth={18} strokeLinecap="round" />
      <line x1="158.42" y1="158.42" x2="117.41" y2="117.41" strokeWidth={18} strokeLinecap="round" />
      <circle cx="256" cy="256" r="138" fill="none" strokeWidth={22} />
      <line x1="256.00" y1="224.00" x2="256.00" y2="118.00" strokeWidth={13} strokeLinecap="butt" />
      <line x1="278.63" y1="233.37" x2="353.58" y2="158.42" strokeWidth={13} strokeLinecap="butt" />
      <line x1="288.00" y1="256.00" x2="394.00" y2="256.00" strokeWidth={13} strokeLinecap="butt" />
      <line x1="278.63" y1="278.63" x2="353.58" y2="353.58" strokeWidth={13} strokeLinecap="butt" />
      <line x1="256.00" y1="288.00" x2="256.00" y2="394.00" strokeWidth={13} strokeLinecap="butt" />
      <line x1="233.37" y1="278.63" x2="158.42" y2="353.58" strokeWidth={13} strokeLinecap="butt" />
      <line x1="224.00" y1="256.00" x2="118.00" y2="256.00" strokeWidth={13} strokeLinecap="butt" />
      <line x1="233.37" y1="233.37" x2="158.42" y2="158.42" strokeWidth={13} strokeLinecap="butt" />
      <circle
        cx="256"
        cy="256"
        r="36"
        fill={brandHub ? 'var(--brand)' : 'currentColor'}
        stroke="none"
      />
    </svg>
  )
}
