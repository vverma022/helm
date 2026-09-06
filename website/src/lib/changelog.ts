// The repo's CHANGELOG.md is the source of truth for release notes: the same
// file `scripts/release.ts` extracts from to feed Sparkle's update prompt
// (see its header). Importing it raw means the site and the in-app updater can
// never disagree about what shipped.
import changelogSource from '../../../CHANGELOG.md?raw'

export interface ReleaseNotes {
  version: string
  /** `null` for the in-progress section, which has no release behind it. */
  released: boolean
  entries: Array<string>
}

/** Parse the Keep a Changelog subset this project actually writes: a
 *  `## [version]` heading followed by `- ` bullets. Prose above the first
 *  heading is the file's own preamble and is dropped. A parser beats a
 *  markdown dependency here because the shape is enforced by RELEASING.md. */
export function parseChangelog(source: string): Array<ReleaseNotes> {
  const releases: Array<ReleaseNotes> = []
  let current: ReleaseNotes | undefined

  for (const line of source.split('\n')) {
    const heading = line.match(/^##\s+\[([^\]]+)\]/)
    if (heading) {
      current = {
        version: heading[1],
        released: heading[1].toLowerCase() !== 'unreleased',
        entries: [],
      }
      releases.push(current)
      continue
    }
    if (!current) continue
    const entry = line.match(/^[-*]\s+(.*\S)\s*$/)
    if (entry) current.entries.push(entry[1])
  }

  // A heading with nothing under it is a section that was opened for the next
  // release and not written yet; it would render as an empty card.
  return releases.filter((release) => release.entries.length > 0)
}

export const RELEASES = parseChangelog(changelogSource)
