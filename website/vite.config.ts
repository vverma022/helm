import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The app's Cargo version is what `scripts/release.ts` publishes under, so it
// is also the newest artifact name the site can safely guess at. Reading it at
// build time keeps the offline fallback from rotting into a 404 the way a
// hand-copied version does.
const cargoToml = readFileSync(
  fileURLToPath(new URL('../Cargo.toml', import.meta.url)),
  'utf8',
)
const appVersion = cargoToml.match(/^version = "([^"]+)"/m)?.[1]
if (!appVersion) {
  throw new Error('could not read the app version from Cargo.toml')
}

// Vercel sets VERCEL_PROJECT_PRODUCTION_URL on every build. Falling back to it
// means the social card points at a real origin even when VITE_SITE_URL has not
// been set; a custom domain still needs VITE_SITE_URL, because Vercel reports
// its own hostname here.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
const siteUrl =
  process.env.VITE_SITE_URL ?? (vercelUrl ? `https://${vercelUrl}` : undefined)

export default defineConfig(({ command }) => ({
  define: {
    'import.meta.env.VITE_SITE_URL': JSON.stringify(siteUrl ?? ''),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
  },
  server: {
    port: 3000,
    fs: {
      // The changelog page imports the repo's CHANGELOG.md, which sits above
      // this package. Vite refuses to serve outside its root without this.
      allow: [fileURLToPath(new URL('..', import.meta.url))],
    },
  },
  resolve: {
    tsconfigPaths: true,
    // The repo root and website/ each carry a React copy (workspace hoisting).
    // Two React instances in one render throw "invalid hook call".
    dedupe: ['react', 'react-dom'],
  },
  // Bundling every dependency gives the deployed function one self-contained
  // file with exactly one React. It is build-only: in dev Vite evaluates these
  // through its ESM runner, which cannot execute React's CommonJS entry.
  ssr: command === 'build' ? { noExternal: true } : {},
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
}))
