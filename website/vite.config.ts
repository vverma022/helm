import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
    // The repo root and website/ each carry a React copy (workspace hoisting),
    // and two React instances in one render throw "invalid hook call".
    dedupe: ['react', 'react-dom'],
  },
  ssr: {
    // Bundle dependencies into the server output so the function is one
    // self-contained file with exactly one React, and needs no node_modules
    // at runtime.
    noExternal: true,
  },
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
})
