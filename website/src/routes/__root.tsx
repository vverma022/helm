/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import appCss from '@/styles.css?url'

// Absolute URLs are required for og:image, so this has to be the deployed
// origin rather than the repository. Set VITE_SITE_URL in the host's build
// environment; the fallback keeps previews working before a domain exists.
const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://helm.vverma.in'
).replace(/\/$/, '')
const REPO_URL = 'https://github.com/vverma022/helm'
const TITLE = 'Helm — one place to steer all your agents'
const DESCRIPTION =
  'A fast, native desktop app for the coding agent CLIs already on your machine. Claude Code, Codex, Cursor, Amp, OpenCode, Grok, Pi and Kimi — one timeline, entirely local.'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: TITLE },
      { name: 'description', content: DESCRIPTION },
      { name: 'application-name', content: 'Helm' },
      { property: 'og:site_name', content: 'Helm' },
      { property: 'og:title', content: TITLE },
      { property: 'og:description', content: DESCRIPTION },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'en' },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:image', content: `${SITE_URL}/og.png` },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      {
        property: 'og:image:alt',
        content: 'Helm — one place to steer all your agents',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: TITLE },
      { name: 'twitter:description', content: DESCRIPTION },
      { name: 'twitter:image', content: `${SITE_URL}/og.png` },
      {
        name: 'twitter:image:alt',
        content: 'Helm — one place to steer all your agents',
      },
      {
        name: 'theme-color',
        media: '(prefers-color-scheme: light)',
        content: '#fafafa',
      },
      {
        name: 'theme-color',
        media: '(prefers-color-scheme: dark)',
        content: '#0f0f10',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'canonical', href: SITE_URL },
    ],
    scripts: [
      {
        // Search engines and social cards read this for the app listing.
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Helm',
          description: DESCRIPTION,
          url: SITE_URL,
          image: `${SITE_URL}/og.png`,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'macOS, Linux, Windows',
          isAccessibleForFree: true,
          license: 'https://www.gnu.org/licenses/gpl-3.0.html',
          codeRepository: REPO_URL,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }),
      },
      {
        // Resolve the theme before first paint so there is no flash. Dark is
        // the default; an explicit choice in localStorage wins over it.
        children: `try{var d=document.documentElement,t=localStorage.getItem('helm-theme');d.classList.toggle('dark',t!=='light');d.style.colorScheme=t==='light'?'light':'dark'}catch(e){document.documentElement.classList.add('dark')}`,
      },
      ...(import.meta.env.PROD
        ? [
            {
              // The token is public by design; the PROD guard is what keeps
              // `vite dev` traffic out of the numbers.
              type: 'module',
              src: 'https://static.cloudflareinsights.com/beacon.min.js',
              'data-cf-beacon':
                '{"token": "1823c71ef979450681900d0682f8131d"}',
            },
          ]
        : []),
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
