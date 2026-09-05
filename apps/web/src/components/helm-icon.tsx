import type { ProviderKind } from '@helm/client'

export const HELM_ICONS = {
  alert: 'i-helm-alert',
  appearance: 'i-helm-appearance',
  arrowDown: 'i-helm-arrow-down',
  arrowLeft: 'i-helm-arrow-left',
  arrowRight: 'i-helm-arrow-right',
  arrowUp: 'i-helm-arrow-up',
  arrowUpRight: 'i-helm-arrow-up-right',
  bot: 'i-helm-bot',
  chartColumn: 'i-helm-chart-column',
  check: 'i-helm-check',
  chevronDown: 'i-helm-chevron-down',
  chevronRight: 'i-helm-chevron-right',
  cloudUpload: 'i-helm-cloud-upload',
  command: 'i-helm-command',
  compose: 'i-helm-compose',
  copy: 'i-helm-copy',
  cornerDownRight: 'i-helm-corner-down-right',
  ellipsis: 'i-helm-ellipsis',
  eye: 'i-helm-eye',
  eyeOff: 'i-helm-eye-off',
  file: 'i-helm-file',
  fileDiff: 'i-helm-file-diff',
  folder: 'i-helm-folder',
  folderNew: 'i-helm-folder-new',
  fork: 'i-helm-fork',
  gauge: 'i-helm-gauge',
  gitBranch: 'i-helm-git-branch',
  gitCommitHorizontal: 'i-helm-git-commit-horizontal',
  globe: 'i-helm-globe',
  github: 'i-helm-github',
  hourglass: 'i-helm-hourglass',
  info: 'i-helm-info',
  laptop: 'i-helm-laptop',
  list: 'i-helm-list',
  loaderCircle: 'i-helm-loader-circle',
  lock: 'i-helm-lock',
  lockOpen: 'i-helm-lock-open',
  package: 'i-helm-package',
  paperclip: 'i-helm-paperclip',
  panelLeft: 'i-helm-panel-left',
  panelRight: 'i-helm-panel-right',
  pencil: 'i-helm-pencil',
  plus: 'i-helm-plus',
  queue: 'i-helm-queue',
  rotateCw: 'i-helm-rotate-cw',
  rewind: 'i-helm-rewind',
  search: 'i-helm-search',
  server: 'i-helm-server',
  settings: 'i-helm-settings',
  sparkle: 'i-helm-sparkle',
  star: 'i-helm-star',
  starFilled: 'i-helm-star-filled',
  stop: 'i-helm-stop',
  target: 'i-helm-target',
  stopFilled: 'i-helm-stop-filled',
  terminal: 'i-helm-terminal',
  terminalSquare: 'i-helm-terminal-square',
  trash: 'i-helm-trash',
  wrench: 'i-helm-wrench',
  x: 'i-helm-x',
  zap: 'i-helm-zap',
} as const

export type HelmIconName = keyof typeof HELM_ICONS

export function HelmIcon({
  name,
  className,
  label,
}: {
  name: HelmIconName
  className?: string
  label?: string
}) {
  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={`inline-grid size-4 shrink-0 place-items-center ${className ?? ''}`}
      role={label ? 'img' : undefined}
    >
      <span
        aria-hidden="true"
        className={HELM_ICONS[name]}
        style={{ width: '100%', height: '100%' }}
      />
    </span>
  )
}

const FILE_TYPE_ICONS = {
  angular: 'i-helm-file-type-angular',
  astro: 'i-helm-file-type-astro',
  audio: 'i-helm-file-type-audio',
  babel: 'i-helm-file-type-babel',
  biome: 'i-helm-file-type-biome',
  bun: 'i-helm-file-type-bun',
  c: 'i-helm-file-type-c',
  certificate: 'i-helm-file-type-certificate',
  clojure: 'i-helm-file-type-clojure',
  cmake: 'i-helm-file-type-cmake',
  coffee: 'i-helm-file-type-coffee',
  console: 'i-helm-file-type-console',
  cpp: 'i-helm-file-type-cpp',
  crystal: 'i-helm-file-type-crystal',
  csharp: 'i-helm-file-type-csharp',
  css: 'i-helm-file-type-css',
  dart: 'i-helm-file-type-dart',
  database: 'i-helm-file-type-database',
  deno: 'i-helm-file-type-deno',
  diff: 'i-helm-file-type-diff',
  docker: 'i-helm-file-type-docker',
  editorconfig: 'i-helm-file-type-editorconfig',
  elixir: 'i-helm-file-type-elixir',
  elm: 'i-helm-file-type-elm',
  erlang: 'i-helm-file-type-erlang',
  eslint: 'i-helm-file-type-eslint',
  exe: 'i-helm-file-type-exe',
  file: 'i-helm-file-type-file',
  firebase: 'i-helm-file-type-firebase',
  git: 'i-helm-file-type-git',
  gitlab: 'i-helm-file-type-gitlab',
  go: 'i-helm-file-type-go',
  gradle: 'i-helm-file-type-gradle',
  graphql: 'i-helm-file-type-graphql',
  haskell: 'i-helm-file-type-haskell',
  haxe: 'i-helm-file-type-haxe',
  helm: 'i-helm-file-type-helm',
  html: 'i-helm-file-type-html',
  image: 'i-helm-file-type-image',
  java: 'i-helm-file-type-java',
  javascript: 'i-helm-file-type-javascript',
  jinja: 'i-helm-file-type-jinja',
  json: 'i-helm-file-type-json',
  julia: 'i-helm-file-type-julia',
  kotlin: 'i-helm-file-type-kotlin',
  kubernetes: 'i-helm-file-type-kubernetes',
  lock: 'i-helm-file-type-lock',
  lua: 'i-helm-file-type-lua',
  makefile: 'i-helm-file-type-makefile',
  markdown: 'i-helm-file-type-markdown',
  nest: 'i-helm-file-type-nest',
  next: 'i-helm-file-type-next',
  nginx: 'i-helm-file-type-nginx',
  nix: 'i-helm-file-type-nix',
  nodejs: 'i-helm-file-type-nodejs',
  npm: 'i-helm-file-type-npm',
  nuxt: 'i-helm-file-type-nuxt',
  ocaml: 'i-helm-file-type-ocaml',
  pdf: 'i-helm-file-type-pdf',
  perl: 'i-helm-file-type-perl',
  php: 'i-helm-file-type-php',
  pnpm: 'i-helm-file-type-pnpm',
  powershell: 'i-helm-file-type-powershell',
  prettier: 'i-helm-file-type-prettier',
  prisma: 'i-helm-file-type-prisma',
  proto: 'i-helm-file-type-proto',
  pug: 'i-helm-file-type-pug',
  python: 'i-helm-file-type-python',
  react: 'i-helm-file-type-react',
  readme: 'i-helm-file-type-readme',
  rollup: 'i-helm-file-type-rollup',
  ruby: 'i-helm-file-type-ruby',
  rust: 'i-helm-file-type-rust',
  sass: 'i-helm-file-type-sass',
  scala: 'i-helm-file-type-scala',
  settings: 'i-helm-file-type-settings',
  solidity: 'i-helm-file-type-solidity',
  storybook: 'i-helm-file-type-storybook',
  stylelint: 'i-helm-file-type-stylelint',
  supabase: 'i-helm-file-type-supabase',
  svelte: 'i-helm-file-type-svelte',
  svg: 'i-helm-file-type-svg',
  swift: 'i-helm-file-type-swift',
  tailwindcss: 'i-helm-file-type-tailwindcss',
  terraform: 'i-helm-file-type-terraform',
  tex: 'i-helm-file-type-tex',
  turborepo: 'i-helm-file-type-turborepo',
  typescript: 'i-helm-file-type-typescript',
  video: 'i-helm-file-type-video',
  vite: 'i-helm-file-type-vite',
  vitest: 'i-helm-file-type-vitest',
  vue: 'i-helm-file-type-vue',
  webassembly: 'i-helm-file-type-webassembly',
  webpack: 'i-helm-file-type-webpack',
  xaml: 'i-helm-file-type-xaml',
  xml: 'i-helm-file-type-xml',
  yaml: 'i-helm-file-type-yaml',
  yarn: 'i-helm-file-type-yarn',
  zig: 'i-helm-file-type-zig',
  zip: 'i-helm-file-type-zip',
} as const

type FileTypeIconName = keyof typeof FILE_TYPE_ICONS

export function FileTypeIcon({
  path,
  className,
}: {
  path: string
  className?: string
}) {
  const name = fileTypeIconName(path)
  return (
    <span
      aria-hidden="true"
      className={`inline-grid size-4 shrink-0 place-items-center ${className ?? ''}`}
    >
      <span className={FILE_TYPE_ICONS[name]} style={{ width: '100%', height: '100%' }} />
    </span>
  )
}

function fileTypeIconName(path: string): FileTypeIconName {
  const name = path.split(/[\\/]/).at(-1)?.toLocaleLowerCase() ?? path.toLocaleLowerCase()
  if (name.startsWith('readme')) return 'readme'
  if (/^(license|licence|copying)/.test(name)) return 'certificate'
  if (name.startsWith('dockerfile') || name.startsWith('compose.')) return 'docker'
  if (name === 'cmakelists.txt' || name.startsWith('cmake.')) return 'cmake'
  if (name === 'makefile' || name.startsWith('makefile.') || name === 'justfile') return 'makefile'
  if (['cargo.toml', 'cargo.lock', 'rust-toolchain.toml'].includes(name)) return 'rust'
  if (['go.mod', 'go.sum', 'go.work'].includes(name)) return 'go'
  if (name === 'pyproject.toml' || name === 'pipfile' || name.startsWith('requirements')) return 'python'
  if (['bun.lock', 'bun.lockb', 'bunfig.toml'].includes(name)) return 'bun'
  if (name.startsWith('pnpm-') || name === '.pnpmfile.cjs') return 'pnpm'
  if (name === 'yarn.lock' || name.startsWith('.yarnrc')) return 'yarn'
  if (name === 'package.json') return 'nodejs'
  if (name === 'package-lock.json') return 'npm'
  if (name === 'tsconfig.json' || name.startsWith('tsconfig.')) return 'typescript'
  if (name === 'jsconfig.json' || name.startsWith('jsconfig.')) return 'javascript'
  if (['.gitignore', '.gitattributes', '.gitmodules', '.gitconfig'].includes(name)) return 'git'
  if (name === '.editorconfig') return 'editorconfig'
  if (name.startsWith('.env')) return 'settings'
  if (name.startsWith('.prettier') || name.startsWith('prettier.config.')) return 'prettier'
  if (name.startsWith('.eslint') || name.startsWith('eslint.config.')) return 'eslint'
  if (name.startsWith('biome.json')) return 'biome'
  if (name.startsWith('.babel') || name.startsWith('babel.config.')) return 'babel'
  if (name.startsWith('.stylelint') || name.startsWith('stylelint.config.')) return 'stylelint'
  if (name.startsWith('vite.config.')) return 'vite'
  if (name.startsWith('vitest.config.') || name.startsWith('vitest.workspace.')) return 'vitest'
  if (name.startsWith('webpack.')) return 'webpack'
  if (name.startsWith('rollup.config.')) return 'rollup'
  if (name.startsWith('next.config.') || name === 'next-env.d.ts') return 'next'
  if (name.startsWith('nuxt.config.') || name === '.nuxtrc') return 'nuxt'
  if (name.startsWith('astro.config.')) return 'astro'
  if (name === 'angular.json' || name.endsWith('.component.ts')) return 'angular'
  if (name === 'nest-cli.json') return 'nest'
  if (name.startsWith('tailwind.config.')) return 'tailwindcss'
  if (name.startsWith('svelte.config.')) return 'svelte'
  if (name.startsWith('vue.config.')) return 'vue'
  if (name === 'firebase.json' || name === '.firebaserc') return 'firebase'
  if (name === 'supabase.toml') return 'supabase'
  if (name.startsWith('prisma.config.')) return 'prisma'
  if (name === 'turbo.json') return 'turborepo'
  if (name.startsWith('deno.json') || name === 'deno.lock') return 'deno'
  if (name === '.gitlab-ci.yml' || name === '.gitlab-ci.yaml') return 'gitlab'
  if (name === 'kustomization.yaml' || name === 'kustomization.yml') return 'kubernetes'
  if (name === 'chart.yaml' || name === 'values.yaml') return 'helm'
  if (name === 'nginx.conf') return 'nginx'
  if (name === '.nvmrc' || name === '.node-version') return 'nodejs'
  if (['build.gradle', 'settings.gradle', 'gradlew', 'gradlew.bat'].includes(name)) return 'gradle'
  if (name.includes('.stories.') || name.includes('.story.')) return 'storybook'
  if (name === 'gemfile' || name === 'gemfile.lock') return 'ruby'
  if (name === 'pom.xml') return 'java'

  const extension = name.includes('.') ? name.split('.').at(-1) ?? '' : ''
  if (extension === 'rs') return 'rust'
  if (['js', 'mjs', 'cjs'].includes(extension)) return 'javascript'
  if (['ts', 'mts', 'cts'].includes(extension)) return 'typescript'
  if (['jsx', 'tsx'].includes(extension)) return 'react'
  if (['py', 'pyi', 'pyw'].includes(extension)) return 'python'
  if (extension === 'go') return 'go'
  if (['c', 'h', 'm'].includes(extension)) return 'c'
  if (['cc', 'cpp', 'cxx', 'hh', 'hpp', 'hxx', 'mm'].includes(extension)) return 'cpp'
  if (extension === 'cs') return 'csharp'
  if (extension === 'swift') return 'swift'
  if (['kt', 'kts'].includes(extension)) return 'kotlin'
  if (['java', 'class'].includes(extension)) return 'java'
  if (extension === 'rb') return 'ruby'
  if (extension === 'php') return 'php'
  if (['html', 'htm'].includes(extension)) return 'html'
  if (['css', 'less'].includes(extension)) return 'css'
  if (['scss', 'sass'].includes(extension)) return 'sass'
  if (['json', 'jsonc', 'jsonl'].includes(extension)) return 'json'
  if (['yaml', 'yml'].includes(extension)) return 'yaml'
  if (['toml', 'ini', 'cfg', 'conf', 'config'].includes(extension)) return 'settings'
  if (['xml', 'xsl', 'plist'].includes(extension)) return 'xml'
  if (['md', 'mdx', 'markdown'].includes(extension)) return 'markdown'
  if (['sh', 'bash', 'zsh', 'fish'].includes(extension)) return 'console'
  if (['ps1', 'psm1'].includes(extension)) return 'powershell'
  if (['sql', 'db', 'sqlite', 'sqlite3', 'csv', 'xls', 'xlsx'].includes(extension)) return 'database'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'ico', 'tiff'].includes(extension)) return 'image'
  if (extension === 'svg') return 'svg'
  if (extension === 'pdf') return 'pdf'
  if (['mp3', 'wav', 'flac', 'ogg', 'm4a'].includes(extension)) return 'audio'
  if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(extension)) return 'video'
  if (['zip', 'gz', 'tgz', 'bz2', 'xz', '7z', 'rar', 'tar', 'jar'].includes(extension)) return 'zip'
  if (['wasm', 'wat'].includes(extension)) return 'webassembly'
  if (['svelte', 'vue', 'lua', 'dart', 'astro', 'prisma', 'xaml', 'zig', 'nix', 'proto'].includes(extension)) return extension as FileTypeIconName
  if (['tf', 'tfvars'].includes(extension)) return 'terraform'
  if (['graphql', 'gql'].includes(extension)) return 'graphql'
  if (['coffee', 'cson'].includes(extension)) return 'coffee'
  if (extension === 'cr') return 'crystal'
  if (['ex', 'exs'].includes(extension)) return 'elixir'
  if (extension === 'elm') return 'elm'
  if (['erl', 'hrl'].includes(extension)) return 'erlang'
  if (['clj', 'cljs', 'cljc', 'edn'].includes(extension)) return 'clojure'
  if (['hs', 'lhs'].includes(extension)) return 'haskell'
  if (['hx', 'hxml'].includes(extension)) return 'haxe'
  if (['jinja', 'jinja2', 'j2'].includes(extension)) return 'jinja'
  if (extension === 'jl') return 'julia'
  if (['ml', 'mli'].includes(extension)) return 'ocaml'
  if (['pl', 'pm'].includes(extension)) return 'perl'
  if (['pug', 'jade'].includes(extension)) return 'pug'
  if (['scala', 'sbt', 'sc'].includes(extension)) return 'scala'
  if (extension === 'sol') return 'solidity'
  if (['tex', 'sty', 'cls'].includes(extension)) return 'tex'
  if (['diff', 'patch'].includes(extension)) return 'diff'
  if (['exe', 'dll', 'so', 'dylib'].includes(extension)) return 'exe'
  if (extension === 'lock') return 'lock'
  return 'file'
}

const PROVIDER_ICONS: Record<ProviderKind, string> = {
  amp: 'i-helm-provider-amp',
  claude: 'i-helm-provider-claude',
  codex: 'i-helm-provider-openai',
  cursor: 'i-helm-provider-cursor',
  deepSeek: 'i-helm-provider-deepseek',
  fx: 'i-helm-provider-fx',
  openCode: 'i-helm-provider-opencode',
  grok: 'i-helm-provider-grok',
  kimi: 'i-helm-provider-kimi',
  ohMyPi: 'i-helm-provider-ohmypi',
  pi: 'i-helm-provider-pi',
}

export const PROVIDERS: Array<{
  id: ProviderKind
  name: string
  shortName: string
  command: string
}> = [
  { id: 'amp', name: 'Amp', shortName: 'Amp', command: 'amp' },
  { id: 'claude', name: 'Claude Code', shortName: 'Claude', command: 'claude' },
  { id: 'codex', name: 'Codex CLI', shortName: 'Codex', command: 'codex' },
  { id: 'cursor', name: 'Cursor CLI', shortName: 'Cursor', command: 'cursor-agent' },
  { id: 'deepSeek', name: 'DeepSeek Harness', shortName: 'DeepSeek', command: 'dsh' },
  { id: 'fx', name: 'Fx', shortName: 'Fx', command: 'fx' },
  { id: 'openCode', name: 'OpenCode', shortName: 'OpenCode', command: 'opencode' },
  { id: 'grok', name: 'Grok Build', shortName: 'Grok', command: 'grok' },
  { id: 'kimi', name: 'Kimi Code', shortName: 'Kimi', command: 'kimi' },
  { id: 'ohMyPi', name: 'Oh My Pi', shortName: 'Oh My Pi', command: 'omp' },
  { id: 'pi', name: 'Pi', shortName: 'Pi', command: 'pi' },
]

export function providerMeta(provider: ProviderKind) {
  return PROVIDERS.find((candidate) => candidate.id === provider) ?? PROVIDERS[2]!
}

export function ProviderIcon({
  provider,
  className,
  label,
}: {
  provider: ProviderKind
  className?: string
  label?: string
}) {
  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={`inline-grid size-4 shrink-0 place-items-center ${providerColor(provider)} ${className ?? ''}`}
      role={label ? 'img' : undefined}
    >
      <span
        aria-hidden="true"
        className={PROVIDER_ICONS[provider]}
        style={{ width: '100%', height: '100%' }}
      />
    </span>
  )
}

function providerColor(provider: ProviderKind) {
  if (provider === 'amp') return 'text-[#f34e3f]'
  if (provider === 'claude') return 'text-[#d97757]'
  if (provider === 'deepSeek') return 'text-[#4d6bfe]'
  return 'text-[#34363b] dark:text-[#f3f3f3]'
}
