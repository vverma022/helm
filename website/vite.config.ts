import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  server: {
    port: 3000,
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
