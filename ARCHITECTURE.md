# Helm, explained

A tour of the codebase for someone who wants to know what lives where and why,
without needing to read Rust. Read this once and you should be able to find the
file responsible for anything you see in the app.

---

## The one idea that explains everything

**Helm is two programs, not one.**

```
   Helm.app                      helm-daemon
   ┌──────────────┐              ┌──────────────────────┐
   │ draws pixels │◀──socket────▶│ runs the agents      │
   │ handles keys │   messages   │ owns the database    │
   │ nothing else │              │ touches your files   │
   └──────────────┘              └──────────────────────┘
```

The window you see never runs an agent, never opens your database, never reads
a file. It sends a message across a WebSocket and waits. A separate background
process does all the real work.

This seems like extra complexity until you notice what it buys:

- The daemon can live on **another machine**. Your laptop draws the window, a
  server in the next room does the work. That is why the mobile app can exist
  at all.
- The UI cannot corrupt your data, because it has no access to it.
- Agent sessions survive the window closing.

Almost every "why is it built like that?" question resolves to this split.

---

## The five Rust pieces

| Folder | Size | One sentence |
| --- | --- | --- |
| `src/` | ~74k lines | The desktop app: every pixel you see |
| `crates/helm-core/` | ~46k lines | The daemon's brain: agents, database, git |
| `crates/helm-protocol/` | ~7.6k lines | The vocabulary the two halves speak |
| `crates/helm-client/` | ~3.5k lines | The desktop's end of the socket |
| `crates/helm-daemon/` | **205 lines** | The daemon program itself |

That last row is not a typo, and it is the most informative number here.
`helm-daemon` is 205 lines because it is a thin `main()` wrapper. All the
intelligence sits in `helm-core`, which is a *library*. Keeping them apart
means the daemon's logic can be tested without launching a process.

---

## `crates/helm-protocol` — start here

The smallest crate and the best entry point. It defines every message the two
halves can exchange:

- **`Command`** — the desktop asking for something ("open this project")
- **`Response`** — the daemon answering
- **`Event`** — the daemon announcing something happened ("new text arrived")

It is also where the **TypeScript types come from**. The Rust types are
annotated so that `bun run protocol:generate` writes
`packages/helm-client/src/generated/`. That is why the web and mobile clients
can never drift from the Rust: change a type here and the generated TypeScript
changes with it. CI fails if you forget to regenerate.

If you read one file in this repo, make it `model.rs`.

---

## `crates/helm-core` — the daemon's guts

The interesting part is `driver/`. **Eleven agent CLIs speak seven different
protocols**, and this folder normalises all of them into one event stream:

| File | Protocol | Providers |
| --- | --- | --- |
| `claude.rs` | NDJSON over stdin/stdout | Claude Code |
| `codex.rs` | JSON-RPC | Codex CLI |
| `acp.rs` | Agent Client Protocol | Cursor, Fx, Grok, Kimi |
| `opencode.rs` | HTTP + server-sent events | OpenCode |
| `amp.rs` | streaming JSON | Amp |
| `pi.rs` | NDJSON request/response | Pi, Oh My Pi |
| `deepseek.rs` | typed HTTP + downlink | DeepSeek Harness |

Every one produces the *same* `DriverEvent` types. **That normalisation is the
product.** It is the reason one timeline can show every agent, and the reason
adding a twelfth provider does not touch the UI at all.

Also here: SQLite persistence, the git checkpointing that makes rewind work,
worktrees, the blob store for attachments, and skills.

---

## `src/` — the desktop app

Built on **GPUI**, the GPU framework behind the Zed editor. No browser engine,
no Electron. One Rust binary drawing straight to the GPU, which is why it
starts instantly and scrolls smoothly through an enormous transcript.

| Path | What it is |
| --- | --- |
| `app.rs` + `app/` | The whole UI. One root object holds all state. |
| `app/transcript_view.rs` | The scrolling conversation, virtualised |
| `app/composer.rs` | The input box, autocomplete, slash commands |
| `app/right_panel.rs` | Diffs, file tree, terminal |
| `app/background_work.rs` | Running processes and **subagents** |
| `md/` | A custom Markdown parser and renderer |
| `ui/` | In-house widgets: menus, tooltips, text fields |
| `driver/` | A proxy turning UI calls into daemon RPC |
| `theme.rs` | Colours, including the accent you can change |
| `query.rs` | The one sanctioned way to fetch data |

Two of these deserve a note.

**`md/` is a custom Markdown engine.** Not a library. Off-the-shelf parsers
assume they get the whole document; here text arrives a token at a time and
must render while still incomplete.

**`ui/` exists because GPUI ships almost nothing.** No button, no menu, no text
field. Every widget is hand-built, which is why the folder is bigger than you
would expect.

---

## Everything else

| Folder | What it is |
| --- | --- |
| `apps/web/` | Browser client (TanStack Start) |
| `apps/mobile/` | iOS and Android client (Expo) |
| `packages/helm-client/` | Shared JS client; `src/generated` comes from Rust |
| `website/` | The marketing site at helm.vverma.in |
| `locales/` | Every user-visible string, in 3 languages |
| `resources/` | App icons, Info.plist, installer scripts |
| `design/logo/` | Logo masters and the generators that produce them |
| `scripts/` | Dev watcher, release build, appcast signing |
| `docs/` | Provider map, performance rules, platform notes |
| `db/` | Drizzle schema for the daemon's SQLite |
| `target/`, `node_modules/` | Build output. Never edit; safe to delete. |

---

## The three rules that explain most decisions

**1. Never block the frame.**
`AGENTS.md` treats a `git` call reachable from rendering as a *bug*, even a
cached one. Anything a frame touches must already be in memory. Slow work goes
to a background thread and calls `notify()` when it lands. This is why the app
stays smooth with a huge transcript open.

**2. No user-facing text in the code.**
Every string goes through `tr!` against `locales/app.yml`, and `ja.yml` and
`zh-CN.yml` must gain the same key. All three files carry the same ~1050 keys.

**3. Paths from the daemon belong to the daemon's machine.**
Never resolve or display one as if it were local. The daemon may be somewhere
else entirely.

---

## Following one action all the way through

You type a prompt and press enter:

1. `app/composer.rs` takes the keystroke
2. `driver/` turns it into a `Command` and hands it to `helm-client`
3. `helm-client` writes it to the socket
4. `helm-core`'s server reads it, finds the session's driver
5. The driver (say `claude.rs`) writes to the CLI's stdin
6. The CLI streams tokens back
7. The driver parses them into `DriverEvent::TextDelta`
8. Those cross the socket as `Event`s
9. `app/streaming.rs` drains them, batching at about 8 per second
10. `md/` parses the partial Markdown
11. `app/transcript_view.rs` draws it

Steps 4 through 7 are the only place that knows Claude Code exists. Swap in
Codex and only step 5 to 7 change.

---

## Where to start reading

1. **`AGENTS.md`** — the constitution. Explains *why*, not just what.
2. **`crates/helm-protocol/src/model.rs`** — the vocabulary.
3. **`docs/providers.md`** — the seven-transports map.
4. **`src/app/background_work.rs`** — small, self-contained, and where the
   agent graph feature would land.

That last one is deliberate. It already tracks subagents and their parent
links; it is both readable and the natural place for a first real change.
