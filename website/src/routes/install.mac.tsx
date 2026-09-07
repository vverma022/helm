import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Download, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { InstallCommand } from '@/components/install-command'
import { FALLBACK_DOWNLOAD_URL, releaseQuery } from '@/lib/release'
import type { ReactNode } from 'react'

export const Route = createFileRoute('/install/mac')({
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(releaseQuery)
  },
  component: InstallMac,
  head: () => ({
    meta: [
      { title: 'Install Helm on macOS' },
      {
        name: 'description',
        content:
          'Download Helm for macOS and get past the first-launch security prompt in three steps.',
      },
    ],
  }),
})

const REPO_URL = 'https://github.com/vverma022/helm'
const WINDOWS_DOCS_URL = `${REPO_URL}/blob/main/docs/windows.md`
const LINUX_DOCS_URL = `${REPO_URL}/blob/main/docs/linux.md`

/** Both variants ship so the figure follows the site's theme toggle, which
 *  swaps a class rather than reading prefers-color-scheme. */
function Shot({
  light,
  dark,
  alt,
  width,
  height,
}: {
  light: string
  dark: string
  alt: string
  width: number
  height: number
}) {
  const common =
    'block h-auto w-full rounded-lg border border-border bg-muted/30'
  return (
    <div style={{ maxWidth: width / 2 }}>
      <img
        src={light}
        alt={alt}
        width={width}
        height={height}
        className={`${common} dark:hidden`}
      />
      <img
        src={dark}
        alt=""
        aria-hidden
        width={width}
        height={height}
        className={`hidden ${common} dark:block`}
      />
    </div>
  )
}

function Step({
  n,
  title,
  children,
  figure,
}: {
  n: number
  title: string
  children: ReactNode
  figure?: ReactNode
}) {
  return (
    <li className="border-t border-border py-10 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand font-mono text-[11px] font-medium text-brand-foreground">
          {n}
        </span>
        <h2 className="text-[17px] font-medium tracking-tight">{title}</h2>
      </div>
      <div className="mt-3 max-w-2xl space-y-3 pl-9 text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </div>
      {/* Shown at 1x of the 2x capture, so the system UI reads at the size the
          user will actually see it rather than an upscaled blur. */}
      {figure ? <div className="mt-5 pl-9">{figure}</div> : null}
    </li>
  )
}

function InstallMac() {
  const { data: release } = useQuery(releaseQuery)
  const downloadUrl = release?.url ?? FALLBACK_DOWNLOAD_URL

  return (
    <div className="flex min-h-svh flex-col antialiased">
      <SiteHeader
        repoUrl={REPO_URL}
        action={
          <Button size="sm" variant="brand" render={<a href={downloadUrl} />}>
            <Download data-icon="inline-start" />
            Download
          </Button>
        }
      />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16 lg:px-8">
        <p className="font-mono text-[11px] tracking-[0.18em] text-brand uppercase">
          macOS · Apple Silicon
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em]">
          Installing Helm on macOS
        </h1>
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
          Helm is signed, but not yet notarised by Apple. macOS asks you to
          confirm the first launch. It takes about thirty seconds, and you only
          do it once.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            variant="brand"
            className="h-11 px-5"
            render={<a href={downloadUrl} />}
          >
            <Download data-icon="inline-start" />
            Download the .dmg
          </Button>
          <span className="font-mono text-xs text-muted-foreground">
            {release ? `v${release.version}` : 'Latest'} · Apple Silicon
          </span>
        </div>

        <ol className="mt-16">
          <Step n={1} title="Drag Helm into Applications">
            <p>
              Open the downloaded <code className="font-mono text-[13px]">.dmg</code>{' '}
              and drag the Helm icon onto the Applications folder beside it.
              Then eject the disk image.
            </p>
          </Step>

          <Step
            n={2}
            title="Open Helm, then click Done"
            figure={
              <Shot
                light="/install/gatekeeper-dialog-light.png"
                dark="/install/gatekeeper-dialog.png"
                alt="macOS dialog reading “Helm” Not Opened, with Move to Trash and Done buttons"
                width={520}
                height={486}
              />
            }
          >
            <p>
              macOS will say it could not verify Helm. This is expected — it is
              what an un-notarised app looks like, not a sign that anything is
              wrong with the download.
            </p>
            <p className="flex gap-2.5 rounded-lg border border-brand/30 bg-brand/5 p-3 text-[14px] text-foreground">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-brand" />
              <span>
                Click <strong className="font-medium">Done</strong>. Do not
                click <strong className="font-medium">Move to Trash</strong> —
                it is the highlighted button, and it deletes Helm.
              </span>
            </p>
          </Step>

          <Step
            n={3}
            title="Allow it in Privacy & Security"
            figure={
              <Shot
                light="/install/open-anyway-light.png"
                dark="/install/open-anyway.png"
                alt="System Settings Security section showing “Helm” was blocked to protect your Mac, with an Open Anyway button"
                width={922}
                height={344}
              />
            }
          >
            <p>
              Open <strong className="font-medium text-foreground">System Settings</strong>{' '}
              → <strong className="font-medium text-foreground">Privacy &amp; Security</strong>{' '}
              and scroll to <strong className="font-medium text-foreground">Security</strong>.
              Helm is listed there. Click{' '}
              <strong className="font-medium text-foreground">Open Anyway</strong>{' '}
              and confirm with Touch ID or your password.
            </p>
            <p>
              Helm opens. Every launch after this is an ordinary double-click,
              and updates arrive inside the app.
            </p>
          </Step>
        </ol>

        <section className="mt-16 rounded-xl border border-border bg-muted/30 p-7">
          <h2 className="text-[15px] font-medium tracking-tight">
            Prefer the terminal?
          </h2>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            This installs Helm without any of the steps above. It downloads the
            same disk image, checks the signature, and puts Helm in
            Applications.
          </p>
          <div className="mt-4">
            <InstallCommand />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-[15px] font-medium tracking-tight">
            Why does macOS do this?
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Apple notarises apps by scanning them and issuing a ticket, which
            requires a paid Developer ID. Helm is signed so macOS can verify it
            has not been tampered with since it was built, but it has no
            notarisation ticket yet, so Gatekeeper asks you to vouch for it.
            Once Helm is notarised these steps disappear and the app opens on a
            double-click.
          </p>
        </section>
      </main>

      <SiteFooter
        repoUrl={REPO_URL}
        linuxDocsUrl={LINUX_DOCS_URL}
        windowsDocsUrl={WINDOWS_DOCS_URL}
      />
    </div>
  )
}
