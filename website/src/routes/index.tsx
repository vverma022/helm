import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Menu } from '@base-ui/react/menu'
import {
  Download,
  GitBranch,
  Keyboard,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InstallCommand } from '@/components/install-command'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  WINDOWS_ARCHITECTURES,
  releaseQuery,
  windowsInstallerUrl,
} from '@/lib/release'
import type { ReactNode } from 'react'

export const Route = createFileRoute('/')({
  loader: ({ context }) => {
    // Fire-and-forget: the version chip streams in when the appcast answers.
    void context.queryClient.prefetchQuery(releaseQuery)
  },
  component: Home,
})

const REPO_URL = 'https://github.com/vverma022/helm'
const WINDOWS_DOCS_URL = `${REPO_URL}/blob/main/docs/windows.md`
const LINUX_DOCS_URL = `${REPO_URL}/blob/main/docs/linux.md`

const PROVIDERS = [
  { slug: 'claude', label: 'Claude Code' },
  { slug: 'openai', label: 'Codex' },
  { slug: 'cursor', label: 'Cursor' },
  { slug: 'amp', label: 'Amp' },
  { slug: 'opencode', label: 'OpenCode' },
  { slug: 'grok', label: 'Grok' },
  { slug: 'pi', label: 'Pi' },
  { slug: 'kimi', label: 'Kimi' },
]

const FEATURES = [
  {
    icon: Zap,
    title: 'Native down to the frame',
    body: 'Rust and GPUI, the framework behind Zed. One binary, instant launch, and smooth scrolling through years of transcript.',
  },
  {
    icon: Layers,
    title: 'Every agent, one timeline',
    body: 'Each CLI is driven over its strongest native interface — stream-json, JSON-RPC, server-sent events — then normalised into one model.',
  },
  {
    icon: GitBranch,
    title: 'Rewind that means it',
    body: 'Every prompt checkpoints your tree under a hidden git ref, so you roll back code and conversation together, not just the chat log.',
  },
  {
    icon: ShieldCheck,
    title: 'Local by architecture',
    body: 'Projects, sessions and transcripts live on your disk. No account, no telemetry, nothing between you and the agents you pay for.',
  },
  {
    icon: Keyboard,
    title: 'Keyboard first',
    body: 'Start a session, queue a follow-up mid-turn, steer the agent, stop it. Every control works without reaching for the mouse.',
  },
  {
    icon: Download,
    title: 'Quietly current',
    body: 'Signed updates land as binary deltas in the background, verified against a pinned key. The app stays fresh without asking for your attention.',
  },
]


const FAQ = [
  {
    q: 'Is this another Electron app?',
    a: 'No. Helm is a single Rust binary rendered by GPUI, the UI framework Zed is built on. The window is drawn by the GPU, not by a browser engine.',
  },
  {
    q: 'Do I need new API keys?',
    a: 'No. Helm detects amp, claude, codex, cursor-agent, opencode, grok, pi and kimi on your machine and drives them directly. Your existing logins, plans and rate limits apply unchanged.',
  },
  {
    q: 'Where does my data live?',
    a: 'On your machine. Projects, sessions, transcripts and provider session IDs are stored locally. There is no Helm account and no telemetry.',
  },
  {
    q: 'macOS says Helm is damaged. What do I do?',
    a: 'Run the install command above instead of opening the .dmg by hand. Helm is signed but not yet notarised by Apple, and since macOS 15 Gatekeeper blocks any un-notarised download outright — the old right-click \u2192 Open trick no longer works. The installer verifies the bundle, puts it in /Applications and clears the download flag for you. Notarisation is coming; this step disappears with it.',
  },
  {
    q: 'What is planned next?',
    a: 'A mobile app for driving sessions remotely, and support for cloud agents.',
  },
]

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] tracking-[0.18em] text-brand uppercase">
      {children}
    </p>
  )
}

function DownloadMenu({
  version,
  size,
  align,
  className,
  showIcon = false,
  variant = 'default',
}: {
  version?: string
  size: 'sm' | 'lg'
  align: 'start' | 'end' | 'center'
  className?: string
  showIcon?: boolean
  variant?: 'default' | 'brand'
}) {
  const itemClassName =
    'flex h-8 cursor-default items-center rounded-md px-2.5 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-45'

  return (
    <Menu.Root>
      <Menu.Trigger
        render={<Button variant={variant} size={size} className={className} />}
      >
        {showIcon && <Download data-icon="inline-start" />}
        Download
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          sideOffset={6}
          align={align}
          className="isolate z-50"
        >
          <Menu.Popup className="min-w-52 origin-(--transform-origin) rounded-lg border bg-popover p-1 text-popover-foreground shadow-md outline-none data-[side=bottom]:slide-in-from-top-1 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <Menu.Item
              closeOnClick
              className={itemClassName}
              render={<Link to="/install/mac" />}
            >
              macOS (Apple Silicon)
            </Menu.Item>
            <Menu.LinkItem
              href={LINUX_DOCS_URL}
              target="_blank"
              rel="noreferrer"
              closeOnClick
              className={itemClassName}
            >
              Linux (x86_64, arm64)
            </Menu.LinkItem>
            {WINDOWS_ARCHITECTURES.map(({ arch, label }) => (
              <Menu.LinkItem
                key={arch}
                href={
                  version ? windowsInstallerUrl(version, arch) : WINDOWS_DOCS_URL
                }
                closeOnClick
                className={itemClassName}
              >
                {label}
              </Menu.LinkItem>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

function Home() {
  const { data: release } = useQuery(releaseQuery)

  return (
    <div className="min-h-dvh antialiased">
      <SiteHeader
        repoUrl={REPO_URL}
        action={
          <DownloadMenu version={release?.version} size="sm" align="end" />
        }
      />

      <main>
        {/* Hero. Centred so the composition fills the width, with the product
            shot pulled up tight beneath it rather than floating in dead space. */}
        <section className="hero-glow relative isolate -mt-16 overflow-hidden pt-16">
          <div className="mx-auto w-full max-w-6xl px-6 pt-20 text-center md:pt-28 lg:px-8">
            <div className="rise inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3 py-1 font-mono text-[11px] tracking-wide text-muted-foreground">
              <span className="size-1.5 rounded-full bg-brand" />
              macOS · Linux · Windows
            </div>

            <h1
              className="rise mx-auto mt-7 max-w-4xl text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.04em] text-balance md:text-[4.25rem]"
              style={{ animationDelay: '70ms' }}
            >
              One place to <span className="serif text-brand">steer</span> all
              your agents.
            </h1>

            <p
              className="rise mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-pretty text-muted-foreground md:text-lg"
              style={{ animationDelay: '140ms' }}
            >
              You're at the wheel of multiple agent sessions. Helm drives the
              agent CLIs already on your machine — sessions, transcripts, tool
              activity and checkpoints in one fast native window, with nothing
              sent anywhere.
            </p>

            <div
              className="rise mt-9 flex flex-wrap items-center justify-center gap-3"
              style={{ animationDelay: '210ms' }}
            >
              <DownloadMenu
                version={release?.version}
                size="lg"
                className="h-11 px-5"
                align="center"
                showIcon
                variant="brand"
              />
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center rounded-lg border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
              >
                View source
              </a>
            </div>

            <div
              className="rise mt-5 flex flex-col items-center gap-2"
              style={{ animationDelay: '250ms' }}
            >
              <InstallCommand />
              <p className="text-xs text-muted-foreground">
                macOS and Linux. Windows ships an installer.
              </p>
            </div>

            <p
              className="rise mt-4 font-mono text-xs text-muted-foreground"
              style={{ animationDelay: '290ms' }}
            >
              {release
                ? `v${release.version} · free and open source`
                : 'Free and open source'}
            </p>
          </div>

          {/* Product shot, cropped to the app window and bled off the bottom so
              the hero reads as one block rather than two. */}
          <div
            className="rise mx-auto mt-14 w-full max-w-6xl px-6 lg:px-8"
            style={{ animationDelay: '320ms' }}
          >
            <div className="shot">
              <picture>
                <source
                  media="(prefers-color-scheme: dark)"
                  srcSet="/app-screenshot-dark.png"
                />
                <img
                  src="/app-screenshot-light.png"
                  alt="Helm showing a coding-agent session with its transcript and tool activity"
                  width={1950}
                  height={1440}
                  className="block h-auto w-full"
                />
              </picture>
            </div>
          </div>
        </section>

        {/* Providers scroll past on their own. No band colour: the section
            sits on the page ground so it blends instead of reading as a strip. */}
        <section id="works-with" className="mt-24 scroll-mt-20 md:mt-36">
          <div className="mx-auto mb-12 w-full max-w-6xl px-6 text-center lg:px-8">
            <Eyebrow>Works with</Eyebrow>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-balance md:text-[2.5rem]">
              Every agent you <span className="serif">already</span> use.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              Helm drives the CLIs you have installed, over each one&apos;s own
              native protocol. Your logins, plans and rate limits carry over
              unchanged.
            </p>
          </div>
          <div className="marquee overflow-hidden">
            <div className="marquee-track">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  aria-hidden={copy === 1}
                  className="flex shrink-0 items-center gap-x-12 pr-12"
                >
                  {PROVIDERS.map((p) => (
                    <div
                      key={p.slug}
                      className="flex items-center gap-2.5 text-muted-foreground"
                    >
                      <span
                        className="provider-mark size-5"
                        style={{
                          maskImage: `url(/providers/${p.slug}.svg)`,
                          WebkitMaskImage: `url(/providers/${p.slug}.svg)`,
                        }}
                      />
                      <span className="text-sm whitespace-nowrap">{p.label}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features: a real grid with hairline dividers, so the section has
            structure instead of six paragraphs floating in space. */}
        <section id="features" className="scroll-mt-16">
          <div className="mx-auto w-full max-w-6xl px-6 pt-20 pb-10 lg:px-8">
            <Eyebrow>Why native</Eyebrow>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-balance md:text-[2.5rem]">
              Built like a desktop app, because it <span className="serif">is</span> one.
            </h2>
          </div>
          <div className="mx-auto w-full max-w-6xl px-6 pb-20 lg:px-8">
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="bg-background p-7 transition-colors hover:bg-muted/40"
                >
                  <f.icon className="size-[18px] text-brand" strokeWidth={1.75} />
                  <h3 className="mt-4 text-[15px] font-medium tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-16">
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[320px_1fr] lg:px-8">
            <div>
              <Eyebrow>Questions</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">
                Before you download.
              </h2>
            </div>
            <Accordion className="max-w-2xl">
              {FAQ.map((item) => (
                <AccordionItem key={item.q} value={item.q}>
                  <AccordionTrigger className="text-[15px]">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="max-w-[40rem] text-[15px] leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
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
