# Helm roadmap

What to build next, and why. Grounded in two things: what the code can already
support, and what the rest of the market has and has not solved.

Researched September 2026. Sources at the bottom.

---

## Where Helm actually stands

The competitive field is **crowded** — 50+ agent orchestrators exist. Being
"a GUI for coding agents" is not a position.

Two things genuinely separate Helm:

1. **It is native.** Almost every competitor is Electron, including T3 Code.
   Helm is Rust + GPUI, the framework behind Zed. On a long transcript that is
   not a nice-to-have; it is the whole reason to use it.
2. **The daemon split.** Very few competitors separate the window from the
   worker. It is what lets the daemon run elsewhere, and it is already built.

Two things are commodity and should not be sold as differentiators: worktrees
and multi-agent parallelism. Nearly everyone has both.

One caution: **GraphCode already ships a graph view** where nodes are live
terminals and edges are handoffs. Helm's graph is still worth building, but it
must be a *different* graph — see below.

---

## Tier 1 — build these first

### 1. Agent graph: what spawned what — ⬜ NOT STARTED

Agents increasingly run agents. One prompt fans out into a subagent that spawns
two more, some finishing while others run. Helm currently renders that as a
**flat list**, throwing away the one fact you want: the shape.

**This is far cheaper than it looks.** `BackgroundWorkItem` already carries:

| Field | What it gives you |
| --- | --- |
| `kind: Subagent` | Subagents are already first-class |
| `parent_id` | **The edge.** Parent to child, already modelled |
| `origin_activity_id` | Links a node to the transcript line that spawned it |
| `role`, `model` | Node labels, no invention needed |
| `status` | Live vs terminal, `is_live()` already exists |
| `started_at_ms`, `duration_ms` | Elapsed time per node |

`parent_id` is populated by the Codex driver, merged into the desktop store —
and then **never read**. The tree is already captured and transported; it is
discarded at render time. This is a rendering feature, not a protocol change.

**How it differs from GraphCode:** theirs graphs *sessions* handing off to each
other. This graphs *one turn's* internal fan-out. Different altitude, and the
one that answers "what is my agent actually doing right now".

**Watch out:** only Codex fills `parent_id` today, so the graph must degrade to
one root with N children and still look deliberate. And the layout must be
cached, not recomputed per frame.

---

### 2. Cost and quota, across every provider — ✅ SHIPPED (unreleased)

Research finding: **cost control now outranks raw capability** in how
developers pick tools. Most orchestrators show a token count and stop there.

Helm already has `usage_page.rs` and a usage meter. Extend it into the thing
nobody has done well:

- Spend per provider, per project, per session
- Burn rate, and how long until a quota resets
- A warning *before* a long run exhausts a plan
- "This turn cost X" attached to the turn itself

You are already paying for several agent subscriptions. So is everyone in the
target market. Nobody can currently see where it goes.

---

### 3. One approvals inbox — ⬜ NOT STARTED

When several agents run, each pauses independently to ask permission, and you
end up hunting for whichever one is blocked. One queue of every pending
permission across every session — approve, deny, or approve-for-this-session —
turns a scavenger hunt into a list.

`octomux` has this. It is table stakes for parallel work, and Helm's
`Permission` driver event already carries what it needs.

---

## Tier 2 — strong, more work

### 4. MCP server management — ⬜ NOT STARTED

Every agent CLI supports MCP servers, and configuring them today means editing
a different config file per CLI by hand.

Helm already knows how to inject provider config (`driver/support.rs` writes
OpenCode's MCP block; the computer-use helper *is* an MCP server). But there is
no user-facing management.

One place to add a server, toggle it per project, and let Helm write each
provider's native config. This is the strongest "why Helm instead of the raw
CLI" feature available, because Helm uniquely sits above every provider.

### 5. Search across sessions — ⬜ NOT STARTED

`transcript_search.rs` searches inside one transcript. There is no way to
search across all of them, and everything already lives in daemon SQLite.
Mostly a query plus a results surface. Needs a full-text index, and it must not
block the socket.

### 6. Hooks — ⬜ NOT STARTED

Run a command on turn start or finish: format, test, notify. Small to build,
composes with everything. Decide first whether hooks run on the daemon host or
the desktop host — paths belong to the daemon's machine.

---

## Tier 3 — worth considering

- **Sandboxing.** Fletch uses Seatbelt/Docker; intentic uses per-agent
  containers. Real demand, significant work.
- **Parallel comparison.** Same prompt to two providers, diff the results.
  Mostly composition of worktrees + task switcher, which exist.
- **Scheduling.** Run an agent on a cron. Garcon has it.
- **Slack / Linear intake.** Turn a ticket into a session. Open Session has it.

---

## Deliberately not doing

- **A twelfth provider.** Eleven across seven transports is already a large
  surface for a fork. Depth beats breadth.
- **A Helm account or cloud sync.** "No account, no telemetry" is on the site
  and in the FAQ. It is a position, not an oversight.
- **Kanban boards.** A dozen competitors have one. It is not why anyone would
  switch.
- **Chasing Electron features.** The native advantage is the moat. Anything
  that costs frame time costs the moat.

---

## Shipped, awaiting release

Everything below is on `main` but unreleased. Bump `version` in `Cargo.toml`,
rename `## [unreleased]` in CHANGELOG.md to that version, and merge with
`(RELEASE)` in the commit subject — `.github/workflows/release-on-merge.yml`
dispatches the build from there.

| Area | What changed |
| --- | --- |
| Sidebar | Project grouping is the default, and a project with no tasks still gets a section with a visible compose button. |
| Provider default | `last_provider` reconciles against detection, so a fresh install stops defaulting to a Codex nobody has. |
| Provider auth | `ProviderProbe.authenticated` (Cursor only so far, via `cursor-agent about`). Signed-out CLIs say so on the Providers page, offer a sign-in button, and leave the model picker rather than serving a fallback the agent then rejects. |
| Quota | Plan quota for every installed provider on the Usage page, with reset times. |
| Usage | Providers and models with no usage leave the legend, the daily table and the breakdown — this is what removed the `<synthetic>` row. |
| Onboarding | The welcome screen lists the agent CLIs actually detected. |
| Theme | Selection carries the accent in the sidebar, the settings nav, the usage toggles and the model chip. Provider brand colours are untouched. |
| Icons | Red mark for release, white for debug, website assets generated from the release artwork. |
| Website | `/changelog` reads CHANGELOG.md directly; the download fallback version derives from `Cargo.toml` instead of a hand-copied literal. |
| Release | `(RELEASE)` in a merge subject dispatches the existing release workflow, and refuses to start if CHANGELOG.md has no section for the version. |

---

## Next release — candidates

Ordered by value per unit of work, given what now exists.

1. **Agent graph** (Tier 1 #1). Still the highest visible value; `parent_id` is
   already transported and discarded at render time.
2. **Finish provider auth.** Only Cursor answers today. Claude and Codex are
   nearly free — their quota fetchers already read the credential files that
   would answer it.
3. **`on_accent` theme token.** Accent cannot fill a button today because
   nothing defines a readable foreground on it, and Graphite would fail
   contrast with white. This is what blocks accent from going further.
4. **`/model` as a slash command.** Every slash command currently forwards to
   the provider, so a client-side one needs interception before submit.
   `Cmd+/` already opens the picker, so this is discoverability only.
5. **Cursor quota.** Blocked upstream: no usage command, no readable
   credential. Revisit only if Cursor ships one.
6. **Fresh marketing screenshots.** The site still shows Waku-era transcripts.

---

## Suggested order

1. **Agent graph** — highest visible value per unit of work, and most of it
   already exists
2. **Cost tracking** — matches the strongest signal in the research
3. **Approvals inbox** — makes parallel work bearable
4. **MCP management** — the deepest structural advantage
5. **Cross-session search** — high value per unit of work

---

## Known debt to clear alongside

| Item | Detail |
| --- | --- |
| Screenshots | `app-screenshot-*.png` still show "Waku" in the transcript. Needs a fresh capture, not a crop. **Still open.** |
| Code signing | No Developer ID, so releases are ad-hoc and Gatekeeper blocks them. $99/yr fixes it. |
| ~~Debug vs release icon~~ | ✅ Done. `scripts/app-icon.sh` derives a red-mark release icon from the white debug one, and syncs the website's icons from the same artwork. |
| `apps/web` favicon | None, so the browser tab is blank. |
| OG card generator | The 1200x630 card is committed as a PNG with no source in the repo, so it cannot be regenerated. |
| rustfmt drift | CI pins Rust 1.96.0; a newer local rustfmt reformats 27 untouched files. Never run a blanket `cargo fmt` — check against a stashed baseline and hand-fix only your own hunks. |

---

## Sources

- [awesome-agent-orchestrators](https://github.com/andyrewlee/awesome-agent-orchestrators) — the 50+ tool survey
- [T3 Code on GitHub](https://github.com/pingdotgg/t3code)
- [T3 Code guide, Better Stack](https://betterstack.com/community/guides/ai/t3-code/)
- [Best AI Coding Agents 2026, Faros](https://www.faros.ai/blog/best-ai-coding-agents-2026)
- [State of CLI Coding Agents, Mid-2026](https://blog.arcbjorn.com/state-of-cli-coding-agents-2026)
- [AI Coding Agents 2026 roadmap, CodePick](https://codepick.dev/en/guides/ai-coding-agents-2026-roadmap/)
