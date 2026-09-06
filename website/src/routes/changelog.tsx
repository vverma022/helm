import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { RELEASES } from '@/lib/changelog'
import { releaseQuery } from '@/lib/release'

export const Route = createFileRoute('/changelog')({
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(releaseQuery)
  },
  component: Changelog,
  head: () => ({
    meta: [
      { title: 'Changelog — Helm' },
      {
        name: 'description',
        content: 'What shipped in each release of Helm.',
      },
    ],
  }),
})

const REPO_URL = 'https://github.com/vverma022/helm'
const WINDOWS_DOCS_URL = `${REPO_URL}/blob/main/docs/windows.md`
const LINUX_DOCS_URL = `${REPO_URL}/blob/main/docs/linux.md`

function Changelog() {
  const { data: release } = useQuery(releaseQuery)

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader
        repoUrl={REPO_URL}
        action={
          <Button
            size="sm"
            render={<Link to="/" />}
          >
            Download
          </Button>
        }
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pt-16 lg:px-8">
        <h1 className="text-4xl font-semibold tracking-tight">Changelog</h1>
        <p className="mt-4 text-muted-foreground">
          Every release, newest first. Helm updates itself, so you are normally
          already on the latest one.
        </p>

        <ol className="mt-14 space-y-14">
          {RELEASES.map((entry) => {
            // Only the appcast knows which version is actually published; the
            // file's newest section may still be waiting to ship.
            const latest =
              entry.released && release?.version === entry.version

            return (
              <li key={entry.version} className="relative">
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="font-mono text-xl font-semibold tracking-tight">
                    {entry.released ? entry.version : 'Unreleased'}
                  </h2>
                  {latest ? (
                    <span className="rounded-full border border-brand/40 px-2 py-0.5 font-mono text-[11px] tracking-[0.12em] text-brand uppercase">
                      Latest
                    </span>
                  ) : null}
                  {!entry.released ? (
                    <span className="rounded-full border px-2 py-0.5 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                      In progress
                    </span>
                  ) : null}
                  {entry.released ? (
                    <a
                      href={`${REPO_URL}/releases/tag/v${entry.version}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Release notes &rarr;
                    </a>
                  ) : null}
                </div>

                <ul className="mt-5 space-y-3">
                  {entry.entries.map((line) => (
                    <li
                      key={line}
                      className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground"
                    >
                      <span
                        aria-hidden
                        className="mt-2.5 size-1 shrink-0 rounded-full bg-brand/70"
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ol>
      </main>

      <SiteFooter
        repoUrl={REPO_URL}
        linuxDocsUrl={LINUX_DOCS_URL}
        windowsDocsUrl={WINDOWS_DOCS_URL}
      />
    </div>
  )
}
