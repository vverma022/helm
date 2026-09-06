# Helm — where this goes next

Helm is a fork of Waku, rebranded and now developed on its own line. This is
the working list of what to build, why each item is worth it, and what it
actually costs given the code that exists today.

Everything below was checked against the source rather than imagined. Where a
feature is cheaper than it looks, that is called out, because those are the
ones to do first.

---

## 1. Agent graph — see what spawned what

**The idea.** Agents increasingly run other agents. A single prompt can fan out
into a subagent that spawns two more, each running tools, some finishing while
others are still going. Today that is a flat list, so the one thing you want to
know — *what is running, and what launched it* — is the one thing the UI
throws away.

Replace the flat list with a live graph: the turn at the root, subagents
branching from it, each node showing role, model, status and elapsed time,
updating as events arrive.

**Why it is cheaper than it looks.** The data model already describes a tree.
`BackgroundWorkItem` in [`crates/helm-protocol/src/model.rs`](crates/helm-protocol/src/model.rs)
carries:

| Field | What it gives the graph |
| --- | --- |
| `kind: Subagent` | Subagents are already a first-class kind, not a guess |
| `parent_id: Option<String>` | **The edge.** Parent → child, already modelled |
| `origin_activity_id` | Links a node back to the transcript line that spawned it |
| `role`, `model` | Node labels without inventing metadata |
| `status` | Live vs terminal, with `is_live()` already defined |
| `started_at_ms`, `duration_ms` | Elapsed time per node |

`parent_id` is populated by the Codex driver
([`driver/codex.rs:1586`](crates/helm-core/src/driver/codex.rs#L1586)) and
merged into the desktop store at
[`background_work.rs:162`](src/app/background_work.rs#L162) — and then **never
read by anything**. Subagents are filtered into a flat list at
[`background_work.rs:1455`](src/app/background_work.rs#L1455).

So the parent link is already captured, transported and stored. It is discarded
at render time. This is a rendering feature over data that already flows, not a
protocol change.

**What it actually needs**

1. Build the tree in a free function: `Vec<BackgroundWorkItem>` → nodes and
   edges, keyed by `provider_id`, parented by `parent_id`. Orphans (a
   `parent_id` whose parent has been evicted) attach to the root rather than
   vanishing. This is pure logic, so it is unit-testable with no `App` —
   the pattern in [`src/app/tests.rs`](src/app/tests.rs).
2. Lay it out. A tidy layered tree is enough; nothing here needs force
   simulation, and a deterministic layout avoids nodes wandering between
   frames.
3. Draw it in GPUI, hit-testing nodes so clicking one scrolls the transcript to
   its `origin_activity_id`.

**Watch out for**

- **Only Codex populates `parent_id` today.** The other six transports will
  return a flat set, so the graph must degrade to "one root, N children" and
  still look deliberate. Filling in the other drivers is separate work per
  provider, and some CLIs may simply not expose the parentage.
- **The layout must not run per frame.** `AGENTS.md` is explicit that row
  builders and measurement run for every visible item every frame. Compute the
  layout when the work set changes, cache it on the entity, and let render read
  only that.
- Node count is small (tens, not thousands), so this is a clarity problem
  rather than a performance one — but the per-frame rule still applies.

**Worth doing first.** It is the highest ratio of visible value to work in this
list, and it is the feature that most clearly separates Helm from a chat log.

---

## 2. MCP server management

Every agent CLI supports MCP servers, and configuring them today means
hand-editing a different config file per CLI. Helm already knows how to inject
provider config — [`driver/support.rs`](crates/helm-core/src/driver/support.rs)
writes OpenCode's MCP block, and the computer-use helper *is* an MCP server
([`computer_use.rs`](crates/helm-core/src/computer_use.rs)) — but there is no
user-facing management anywhere.

One place to add a server, toggle it per project, and have Helm write each
provider's native config. This is the strongest "why Helm instead of the raw
CLI" feature on the list, because it is a genuine pain that Helm is uniquely
placed to remove: it already sits above every provider.

Cost: real. Per-provider config writers, a settings surface, and care not to
clobber configs the user edited by hand.

---

## 3. Search across sessions

[`transcript_search.rs`](src/app/transcript_search.rs) searches within one
transcript. There is no way to search *across* sessions — and everything is
already in daemon SQLite.

Mostly a query plus a results surface, which makes it high value per unit of
work. The care needed is in the daemon: full-text search over transcript blobs
wants an index, and it must not block the socket while it runs.

---

## 4. Hooks

Effectively absent (one incidental match across the tree). Run a command on
turn start or finish: format, run tests, notify on completion.

Small to build, and it composes with everything else. The design question worth
settling first is whether hooks run on the daemon host or the desktop host —
`AGENTS.md` is clear that paths from the daemon belong to the daemon's machine,
so this has to be decided rather than assumed.

---

## 5. Parallel agent comparison

Worktrees, checkpoints and the task switcher already exist. Running the same
prompt against two providers side by side and diffing the results is mostly
composition of parts already built. Pairs naturally with the agent graph: two
roots instead of one.

---

## Not on the list, deliberately

- **A twelfth provider.** Eleven providers across seven transports is already a
  large surface for a fork to carry. Depth beats breadth here.
- **A Helm account or cloud sync.** "No account, no telemetry" is on the
  website and in the FAQ; it is a positioning choice, not an oversight.
- **Re-theming semantic colours.** Warning, success, danger and the usage gauge
  carry meaning. They stayed out of the minimal-palette pass for that reason.

---

## Known debt worth clearing

These are real and already diagnosed; none are speculative.

| Item | Detail |
| --- | --- |
| Website screenshots | `app-screenshot-*.png` still show "Waku" in the transcript body. Cropping cannot reach it; they need a fresh capture from the running app. |
| `SITE_URL` | Reads `VITE_SITE_URL` with a placeholder fallback. Set it on the host once a domain exists, or social cards point at the wrong origin. |
| Website typecheck | `bun run typecheck` fails in `website/` on a duplicated `@tanstack/router-core` from workspace hoisting. Pre-existing, not CI-gated. |
| rustfmt drift | CI pins Rust 1.96.0; a newer local rustfmt reformats 43 files that are untouched on `main`. Never run a blanket `cargo fmt`. |
| Debug vs release icon | Identical since both went black. If you run both at once you cannot tell them apart in the dock. |
| `apps/web` favicon | The web client has none, so its browser tab is blank. |
