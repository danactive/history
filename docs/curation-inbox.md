# Curation Inbox

The local Curation Inbox searches all configured galleries by place, with optional gallery, album, and category filters. It checks location names, important-tag coverage, and missing photo descriptions. Names recorded in `photo_loc` can be found as neighbourhood/location labels; these are recorded text, not verified geographical boundaries. Unsupported countries are not considered bad metadata.

## Run locally

Use the project's Node/npm versions and installed dependencies. Enable the local admin inbox when starting History:

```sh
HISTORY_LOCAL_ADMIN=true npm run dev
```

Open `http://localhost:3030/admin/curation`. The admin link appears only when `HISTORY_LOCAL_ADMIN=true` enables the inbox. Unset or `false` hides it. The local API accepts localhost/loopback hosts only and rejects cross-origin requests. Hosted deployments do not expose this private index. The existing viewer, Critical-tag coverage page, MCP, and classifier behavior are unchanged.

Run the first scan from the page or terminal:

```sh
npm run curation:scan -- --full
npm run curation:scan -- --status
```

Subsequent incremental scans:

```sh
npm run curation:scan
npm run curation:scan -- --gallery demo --album sample
```

The second command requests a recheck of the indicated album and dependent aggregate findings. Shared place interpretation and the global covered-album tag median can require refreshing other albums. Scanning works without a browser, Next.js, internet, or the optional classifier. No scanning command modifies XML or media.

`config.local.json`'s existing `critical-tags` array controls tag opportunities. Without configured tags, that detector is shown as unconfigured. Missing descriptions and below-median coverage are opportunities rather than invalid metadata.

## Review and save

1. Find a place or choose a category. Multiple findings on a photo share a row; whole-album tag findings remain separate.
2. Choose **Review in Album Editor** to open the exact source occurrence. Reused media in different albums remain separate edits.
3. Review original/proposed values and evidence. **Accept suggestion** stages one field only. Uncertain candidates require manual editing.
4. Use the existing **Generate XML** and **Save to XML** actions. Returning without saving leaves the finding open.
5. Return to the inbox. Saved edits await verification and disappear only after a successful recheck. Filters and the row/place position are preserved.

Inbox saves check the loaded album revision. If another application save or external edit changed it, refresh/review rather than overwrite it. Pending edits remain available on a conflict. Avoid editing the same XML concurrently in an external program: application locks coordinate History writers, but cannot make an external filesystem writer transactional.

## Scheduling on an awake Mac

Scheduling is opt-in. Nothing is installed on build, page load, or scan. Generate a LaunchAgent template after verifying a manual scan:

```sh
npm run curation:schedule
plutil -lint .history/curation/ca.domaindesign.history.curation.plist
```

The template contains absolute Node, TypeScript runner, and project paths. Generation checks executable/file access, configured gallery/album XML, local configuration, and writable state storage. Use `-- --minute 30` to change the default minute 15. For another calendar cadence, edit `StartCalendarInterval` in the prepared plist using `man launchd.plist` before installation.

Install it in the logged-in user's session:

```sh
mkdir -p "$HOME/Library/LaunchAgents"
cp .history/curation/ca.domaindesign.history.curation.plist "$HOME/Library/LaunchAgents/"
launchctl bootstrap "gui/$(id -u)" "$HOME/Library/LaunchAgents/ca.domaindesign.history.curation.plist"
```

The default requests one hourly scan. Each scheduled invocation chooses incremental analysis unless the last successful full scan is seven days old or absent. Missed calendar firings during sleep coalesce into one invocation on wake. The agent does not wake the Mac, prevent sleep, or run outside the logged-in user's session. It needs no browser or web server. Overlapping requests coalesce, and a pending full request is preserved. Manual requests use the same worker.

Inspect scheduling and scan state:

```sh
launchctl print "gui/$(id -u)/ca.domaindesign.history.curation"
npm run curation:scan -- --status
```

The durable operational record is `.history/curation/status.json`, containing progress, times, mode, and errors. It is replaced per run instead of accumulating an unbounded log. Findings/checkpoints stay under ignored `.history/curation/`, never `public/`. Old published generations are bounded to the current and previous successful snapshot. A failed scan retains the last good snapshot and identifies incomplete coverage; it never means the library is clean.

Disable/uninstall:

```sh
launchctl bootout "gui/$(id -u)/ca.domaindesign.history.curation"
rm "$HOME/Library/LaunchAgents/ca.domaindesign.history.curation.plist"
```

After moving the project or changing its Node installation, unload the old agent, regenerate the template, and install it again. The scheduler does not source shell/nvm startup files.

## Recovery and rollback

Run another scan after an interrupted process; valid completed checkpoints are reused. A missing/unreadable album or boundary dataset leaves previous results visible with a warning. Repair the source availability, then scan again. For a stale finding use Recheck; for an incompatible derived format use a full scan. Original XML and media remain authoritative.

Disable the LaunchAgent and unset `HISTORY_LOCAL_ADMIN` to turn off the feature. The derived `.history/curation/` directory can be removed while no scanner is running and rebuilt later. Do not delete the parent `.history/` directory: it can contain unrelated private-media state. Explicitly saved user edits remain ordinary XML edits and are not rolled back by disabling the inbox.

## Verification

`npm run curation:verify` creates and removes a temporary synthetic library. It checks 10,002 photos across two galleries, staged suggestions, explicit XML persistence, stale-save rejection, bounded result pages, and interrupted-scan recovery. It does not edit your library. Component and API tests run with `npm run test:ci`.

The LaunchAgent template has been linted, but installation and real Mac sleep/wake catch-up have not been exercised. A fixture-backed live scheduler test requires separate authorization; no agent is installed by these verification commands.
