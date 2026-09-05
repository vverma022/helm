# Helm development guidance

## Development runtime

- Assume `bun ./scripts/dev.ts` is already running and owns the current
  `Helm Debug.app` process. Source changes are rebuilt, signed, and relaunched
  automatically. Only run it yourself if not already launched.
- During normal development and UI validation, do not run
  `scripts/bundle.sh debug`, start a second watcher, or manually quit/relaunch
  `Helm Debug.app`. Quitting the app also stops the watcher.
- After an edit, wait for the watcher to finish its successful rebuild and
  validate the freshly relaunched debug app. Only start or recover the watcher
  manually when it is confirmed unavailable.
- No visual test unless requested.

## Architecture

Helm Desktop is a GPUI app that is an **RPC client of a separate `helm-daemon`
process**. Nothing in `src/` runs a provider, touches a workspace, or reads
task storage directly — it all goes over the daemon socket. Four crates:

| Crate | Owns |
| --- | --- |
| [`helm-protocol`](crates/helm-protocol) | The wire contract: `Command`/`Response`/`Event`, `PROTOCOL_VERSION`, and every shared model type. `ts-rs`-annotated, so it also generates the browser client's types. |
| [`helm-core`](crates/helm-core) | The daemon's guts: provider drivers, SQLite persistence, blob store, Git, workspaces, skills, usage. |
| [`helm-daemon`](crates/helm-daemon) | The binary. A thin `main` over `helm-core`'s server. |
| [`helm-client`](crates/helm-client) | The Rust side of the socket: handshake, request IDs, subscriptions, replay cursors, daemon supervision. Desktop depends on this, never on `helm-core`. |

Three clients speak that one protocol: `src/` (desktop),
[`apps/web`](apps/web) (TanStack Start), [`apps/mobile`](apps/mobile) (Expo).
The two JS clients share [`packages/helm-client`](packages/helm-client), whose
`src/generated` types come straight from the Rust protocol — see Conventions.

Desktop layout worth knowing before editing:

- `src/app.rs` + `src/app/` — the whole UI. One `Helm` root entity holds all
  state; the sidebar, transcript, and right panel are cached `HelmPane`
  islands. `runtime.rs` owns per-session driver lifecycle, `streaming.rs` the
  event pump, `transcript_view.rs` the virtualized row list.
- `src/driver/` — a proxy that turns `DriverControl` calls into daemon RPC.
  The real drivers live in `crates/helm-core/src/driver/`.
- `src/md/` — the transcript's own Markdown parser, renderer, syntax
  highlighter, and selection model. Not a library; built for streaming.
- `src/ui/` — in-house GPUI primitives (menus, scrollbar, tooltip, text field,
  motion). Extend these rather than adding a widget crate.
- `src/query.rs` — the one sanctioned way to read data that has to be fetched.
  `Ready`/`Pending`/`Missing(token)`, generation-guarded. Do not hand-roll a
  fourth cache with its own counter.

[docs/providers.md](docs/providers.md) is the map of the driver abstraction —
seven transports behind eleven providers, what restarts a session vs. what
applies in place. Read it before touching provider behavior.
[docs/titles.md](docs/titles.md) and
[docs/commit-messages.md](docs/commit-messages.md) cover the two places Helm
invokes an agent CLI headlessly on its own behalf.

## Checks

The dev watcher is the build. Run these directly only to verify a change:

```sh
cargo check
cargo test
cargo test -p helm-core codex          # one crate, filtered by name
cargo test transcript_row_kinds        # one test
cargo fmt --package helm --package helm-protocol --package helm-client --package helm-core --package helm-daemon -- --check
bun run protocol:check
bun run --filter @helm/client check
bun run --filter @helm/client test
```

Rust tests are inline `#[cfg(test)] mod tests` blocks; there is no `tests/`
directory. UI behavior is tested by pulling the logic into a free function and
asserting on it ([src/app/tests.rs](src/app/tests.rs) is the pattern) —
`#[gpui::test]` is reserved for the few cases that need a real `App`.
`.cargo/config.toml` caps Cargo at `jobs = 4`, so a cold build is not quick.

## Conventions

- **Wire types are generated downstream.** Change anything in
  `helm-protocol` and run `bun run protocol:generate`, then commit
  `packages/helm-client/src/generated`. Bump `PROTOCOL_VERSION` when the change
  is not backward compatible — three clients negotiate against it.
- **No user-facing string literals.** Text goes through `tr!` / `tr_cow!`
  against [locales/app.yml](locales/app.yml), and `ja.yml` and `zh-CN.yml` must
  gain the same key. `tr_cow!` borrows and belongs on render paths; `tr!`
  allocates and is for interpolation.
- **Paths from the daemon are the daemon host's.** Never resolve, stat, or
  display one as if it were local — the daemon may be on another machine.
- Release desktop config is `~/.helm/app.json`; Debug is isolated at
  `temp/app.json`, so the two never fight over state.

## Performance

- Treat performance as a product requirement, not a follow-up. Helm is a native
  app competing with web clients, and staying smooth under a long transcript on
  a high-refresh display is the point of being native. Prefer the faster design
  when it costs nothing in clarity, and measure before assuming a cost is fine.
- Never block the UI thread with heavy work. Rendering owns it, so anything a
  frame can reach must already be in memory: no subprocess spawns, no
  filesystem walks, no network, no blocking locks, no synchronous IPC.
- Row builders and measurement paths run for every visible item on every frame.
  Treat I/O reached from `render` as a defect even when it looks cheap, is
  cached after the first hit, or only triggers for some rows — one `git`
  invocation is already several frames of budget.
- Move the work to `cx.background_executor().spawn`, store the result on the
  entity, and `cx.notify()` when it lands. Render then reads only that store,
  and a miss means "not known yet" and must degrade gracefully.
- Resolve a whole session or collection in one background pass instead of
  probing per item, and guard it with a generation counter so a result from a
  superseded pass cannot overwrite newer state.
- One-shot user actions such as a click or menu command may work synchronously
  when freshness matters more than latency; frames may not.
- Keep per-frame work proportional to what is on screen. Long collections are
  virtualized with `list()`, and a row builder must not rebuild whole-session
  state; hoist that to a cache refreshed once per frame.
- Streaming CPU is governed by two cadences — stream commits at ≤ ~8.3 Hz and
  pulse-clock ticks at ≤ ~30 Hz — and by what one frame can see. Read
  [docs/performance.md](docs/performance.md) before touching the event pump,
  the pulse clock (`src/ui/motion.rs`), veils, overlay scrollbars, pane
  caching, or anything else a streaming frame reaches; it also records the
  counter-based measurement playbook that actually finds regressions.

## Accessibility

- Treat accessibility as a product requirement too. GPUI does not yet expose a
  screen-reader tree, so here it means keyboard operability, honored system
  settings, and legibility — none of which depend on that missing API, and all
  of which regress silently if left unchecked.
- Every control reachable by mouse must be reachable and operable by keyboard.
  Use `track_focus` with `tab_index`, `tab_group`, and `tab_stop`, give focus a
  visible treatment via `focus_visible`, and support the conventional keys for
  the widget (arrows, `home`/`end`, `enter`/`space`, `escape`).
- Honor the system's reduce-motion setting. `with_animation` already respects
  `App::reduce_motion`, but a direct `window.request_animation_frame` for
  decorative motion must check `cx.reduce_motion()` and skip the request.
- Never encode meaning in color, hover, or motion alone. Pair a status color
  with an icon or text, and make sure anything revealed on hover is also
  reachable by keyboard focus.
- Keep text and icons legible against their surface in both themes, and give
  interactive targets enough hit area — extend the hit region rather than
  shrinking to the glyph.

## Product reference

- Use [T3 Code](https://github.com/pingdotgg/t3code) source code on github as a reference when a task
  concerns coding-agent workflow, information hierarchy, controls, tool
  activity, or transcript presentation and the comparison would materially
  clarify an ambiguous product decision, or when the user explicitly asks for
  the comparison.
- Do not inspect T3 Code for localized bug fixes, straightforward visual
  corrections, native platform behavior, or changes already specified clearly
  by the user. When T3 Code is relevant, inspect its current app or source
  rather than relying on an older screenshot or memory.
- Use [Zed](https://github.com/zed-industries/zed) source code as a reference
  when a task concerns GPUI implementation — layout and styling idioms, focus
  and key dispatch, virtualized lists, menus and popovers, window and platform
  behavior — or when an in-house `src/ui` primitive needs a proven native
  precedent. Zed is the canonical GPUI codebase; read its crates rather than
  `gpui-component`, and read the gpui revision pinned in `Cargo.toml` so the
  APIs match what Helm builds against.
- Split the two references by concern: T3 Code answers what a coding-agent
  client should do, Zed answers how a polished GPUI app implements it. The
  same restraint applies to both — no reference spelunking for localized
  fixes or changes the user has already specified.
- Use the reference as behavioral and design evidence, not as an instruction to
  reproduce web-specific interaction patterns or known bugs. Helm should keep
  native macOS conventions.
- Explicit user screenshots and feedback override a previous or merely
  "consistent" treatment.
- For provider-native content such as citations, reasoning, and tool events,
  verify the real provider payload and preserve its ordering. Never expose
  private provider control markers in the transcript.
- Validate visible changes in the freshly rebuilt, signed app managed by the
  dev watcher against the exact provider interaction; a successful Rust build
  alone is insufficient.
