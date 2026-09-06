import { HelmMark } from '@/components/helm-mark'

const YEAR = new Date().getFullYear()

/** The page's closing statement as well as its navigation: the mark is set
 *  large here because this is the last thing a visitor sees. */
export function SiteFooter({
  repoUrl,
  linuxDocsUrl,
  windowsDocsUrl,
}: {
  repoUrl: string
  linuxDocsUrl: string
  windowsDocsUrl: string
}) {
  const columns = [
    {
      title: 'Product',
      links: [
        { label: 'Agents', href: '#works-with' },
        { label: 'Features', href: '#features' },
        { label: 'Questions', href: '#faq' },
      ],
    },
    {
      title: 'Install',
      links: [
        { label: 'macOS', href: repoUrl + '/releases/latest', external: true },
        { label: 'Linux', href: linuxDocsUrl, external: true },
        { label: 'Windows', href: windowsDocsUrl, external: true },
      ],
    },
    {
      title: 'Project',
      links: [
        { label: 'Source', href: repoUrl, external: true },
        { label: 'Releases', href: repoUrl + '/releases', external: true },
        { label: 'Issues', href: repoUrl + '/issues', external: true },
      ],
    },
  ]

  return (
    <footer className="mt-24 border-t md:mt-32">
      <div className="mx-auto w-full max-w-6xl px-6 pt-16 pb-10 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <HelmMark brandHub className="size-6" />
              <span className="text-base font-semibold tracking-tight">
                Helm
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              One place to <span className="serif text-brand">steer</span> all
              your agents. Native, local, and open source.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...('external' in link && link.external
                        ? { target: '_blank', rel: 'noreferrer' }
                        : {})}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t pt-7 text-xs text-muted-foreground">
          <span>© {YEAR} Helm</span>
          <span className="font-mono tracking-[0.12em] uppercase">
            Built with Rust &amp; GPUI
          </span>
        </div>
      </div>

    </footer>
  )
}
