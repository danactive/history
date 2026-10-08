## Purpose

Analyze local library metadata independently of page rendering and provide durable, trustworthy curation results through scheduled and manual scans on the owner's awake Mac.

## ADDED Requirements

### Requirement: Standalone local scans

The scanner SHALL support full and incremental analysis of configured local metadata without a running browser, Next.js server, internet connection, or classifier. It SHALL write derived scan state only and MUST NOT repair XML, regenerate media, or alter originals. Inbox rendering SHALL read stored findings without starting a library-wide scan.

#### Scenario: Offline full analysis
- **WHEN** a full scan runs with the app and classifier stopped and internet unavailable
- **THEN** metadata analysis completes using local sources and available boundary data
- **AND** XML and original/generated media remain byte-for-byte unchanged

#### Scenario: Open a large inbox
- **WHEN** the owner opens or filters stored findings
- **THEN** the page receives a bounded result page and no full-library analysis starts

### Requirement: Scheduled execution while awake

Scheduling SHALL be opt-in, configurable, and run in the owner's logged-in macOS user session without waking the Mac or preventing sleep. The default SHALL request hourly incremental scans and a full scan when the last successful full scan is at least seven days old or absent. Missed sleep intervals SHALL coalesce into one catch-up invocation after wake rather than replay every missed run. Setup SHALL provide validation, logs, and disable/uninstall instructions.

#### Scenario: Overnight sleep
- **WHEN** several scheduled times pass while the Mac sleeps
- **THEN** no scan wakes or keeps awake the Mac
- **AND** the scheduler requests one catch-up invocation after wake

#### Scenario: Full scan overdue
- **WHEN** the next scheduled invocation finds no successful full scan within seven days
- **THEN** it chooses full analysis instead of incremental analysis
- **AND** only a successful full scan resets that due date

#### Scenario: Scheduler not installed
- **WHEN** the app is built or the inbox is opened before scheduler setup
- **THEN** no scheduled job is installed automatically and manual scanning remains available in local-admin mode

### Requirement: Manual requests and exclusive workers

Scan now SHALL offer incremental and full modes; Recheck SHALL target affected sources and their dependent results. Manual requests SHALL return promptly with run status rather than wait for analysis. Only one worker per library SHALL publish results at a time. Overlapping requests SHALL coalesce into a bounded follow-up request, preserving requested full coverage. Sleep alone SHALL NOT cause an active worker to lose ownership.

#### Scenario: Manual request during a scheduled run
- **WHEN** the owner requests a full scan while an incremental scan is active
- **THEN** the existing run remains visible and one follow-up full request is retained without launching a competing writer

#### Scenario: Worker cannot start
- **WHEN** local runtime or source configuration prevents startup
- **THEN** the owner sees the failure and existing results remain available

### Requirement: Resumable and dependency-aware analysis

Incremental analysis SHALL detect source additions, changes, removals, detector/configuration changes, and boundary changes. It SHALL recompute affected shared place interpretation and aggregate tag coverage so its resulting findings equal full analysis for the same inputs. Interrupted runs SHALL reuse valid completed checkpoints and invalidate changed ones. Sources changed during analysis SHALL NOT be published as freshly checked against their new contents.

#### Scenario: Change affects other albums
- **WHEN** a tag configuration or album update changes the coverage median or shared place interpretation
- **THEN** incremental analysis updates findings for every dependent album even if its XML is unchanged

#### Scenario: Resume after interruption
- **WHEN** a worker terminates after completing part of the library and a later invocation resumes
- **THEN** unchanged completed work is reused, changed work is recomputed, and ownership is recovered only after the previous worker is verified to have exited

#### Scenario: Source changes during scanning
- **WHEN** album content changes after analysis but before publication
- **THEN** the scanner retries affected work or reports incomplete coverage instead of publishing stale findings as current

### Requirement: Reliable snapshots and visible coverage

The inbox SHALL distinguish not scanned, running, complete, incomplete, and failed states, displaying progress, last successful scan time, mode, and coverage failures. Results SHALL publish atomically. An incomplete or failed scan SHALL retain the last complete snapshot with a visible warning; absence of a complete snapshot SHALL NOT be displayed as a clean library. Source unavailability SHALL NOT be treated as deletion.

#### Scenario: One gallery becomes unreadable
- **WHEN** a previously scanned gallery cannot be read during a run
- **THEN** its prior findings remain in the last complete results with a coverage warning
- **AND** the run does not claim that gallery is clean or remove it as deleted

#### Scenario: First scan fails
- **WHEN** the first scan fails before complete results exist
- **THEN** the inbox explains the failure/incomplete coverage rather than showing zero issues found

#### Scenario: Confirmed removal
- **WHEN** a successful source inventory confirms an album was removed
- **THEN** the next complete results remove its findings

### Requirement: Private derived state and protected local controls

Scan results, checkpoints, and operational state SHALL remain in ignored local application storage outside publicly served/build-generated data. Local scan mutation requests SHALL validate allowed operations and source identifiers and reject cross-origin requests. Unsupported hosted operation SHALL not expose the index or execute local jobs. Removing derived state SHALL permit rebuilding findings without an XML migration.

#### Scenario: Rebuild and privacy
- **WHEN** derived state is removed and a full scan is requested locally
- **THEN** findings are reconstructed from authoritative metadata
- **AND** private results are not published as static assets or MCP resources

#### Scenario: Cross-origin trigger
- **WHEN** another origin attempts to trigger a local scan endpoint
- **THEN** the request is rejected and no worker is started
