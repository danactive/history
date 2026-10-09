## Purpose

Help the owner curate metadata across their local photo library by finding places, reviewing actionable findings, and making explicit edits through existing admin tools.

## ADDED Requirements

### Requirement: Today-first gap review

The inbox SHALL prioritize photo findings matching the local server's current month and day across all years, before pagination. Date matching SHALL follow the Today viewer's recorded photo date with filename fallback. A Today-only filter SHALL combine with existing filters, exclude videos and whole-album findings, and preserve URL navigation state. Results SHALL show today's affected-photo and finding counts. Day rollover SHALL update priority when results are read without requiring another scan or writing source metadata. Photos with no tags or no recorded city/location text SHALL receive manual-review opportunities, independently of critical-tag configuration.

#### Scenario: Today's gaps across galleries
- **WHEN** today's photos have missing descriptions, no tags, no recorded city/location text, or location naming warnings
- **THEN** their grouped rows appear ahead of other dates across all selected galleries
- **AND** photos without findings do not become findings solely because they match today

#### Scenario: Date precedence and rollover
- **WHEN** a recorded photo date disagrees with its filename date
- **THEN** its recorded date controls Today matching
- **WHEN** the local day changes
- **THEN** the next inbox read prioritizes the new day's indexed findings without rescanning

### Requirement: Cross-gallery place discovery

The inbox SHALL include every configured local gallery by default without requiring a gallery selection. It SHALL offer place search, category filters, optional gallery/album filters, and grouping by available country, region, city, and recorded location labels. It SHALL preserve ambiguous raw labels as unclassified places and provide Unknown location for items without usable place text. It SHALL NOT present recorded location labels as verified neighbourhood boundaries.

#### Scenario: Search a neighbourhood across galleries
- **WHEN** the owner searches for a neighbourhood name recorded in location fields in two galleries
- **THEN** matching findings from both galleries appear without a gallery-selection step
- **AND** source gallery/album and available parent-place context distinguish the results

#### Scenario: Missing and ambiguous locations
- **WHEN** one photo has no place text and another has ambiguous place text
- **THEN** the first remains discoverable under Unknown location and the second retains its recorded text under an unclassified place
- **AND** the inbox does not invent a country or neighbourhood

#### Scenario: Search normalization and navigation
- **WHEN** the owner searches using different casing or without accents, narrows a category, and reopens the resulting inbox URL
- **THEN** equivalent recorded labels match and the filters and page selection are restored

### Requirement: Explainable metadata findings

The inbox SHALL report missing or whitespace-only photo descriptions, album critical-tag coverage opportunities, and location naming warnings. Critical-tag coverage SHALL use unique matching media counts and the median among positively covered albums across the configured library, independently of inbox filters. Missing descriptions and low tag coverage SHALL be labeled opportunities, not invalid metadata. Location findings SHALL include evidence and original values, use the existing local matching rules, and identify editable source occurrences without requiring a valid photo date.

#### Scenario: Tag configuration and coverage
- **WHEN** no critical tags are configured
- **THEN** the critical-tag detector is shown as unconfigured and creates no album coverage findings
- **AND** photos with no tags can still receive a missing-tags opportunity
- **WHEN** configured tags yield album coverage counts of zero, one, and three
- **THEN** the zero-coverage album and the below-median one-coverage album receive distinct album-level opportunities
- **AND** narrowing a place filter does not change that baseline

#### Scenario: Description scope
- **WHEN** a photo has a whitespace-only description and a video has no description
- **THEN** the photo receives a description opportunity and the video does not receive that v1 finding

#### Scenario: Location warning versus missing support
- **WHEN** a recorded region has a spelling candidate in a supported country's available boundary data
- **THEN** the inbox shows the recorded spelling, candidate, evidence, and source item even if its date is missing
- **AND** an unsupported country alone creates no location error
- **AND** unavailable boundary data is identified as incomplete validation rather than incorrect metadata

### Requirement: Grouped findings retain correct scope

The inbox SHALL group multiple findings for one album item into one row, retain separate rows for distinct XML occurrences, and show album-level findings separately. Counts SHALL distinguish findings, affected photos, and affected albums. Album findings SHALL match a place filter if an item in that album matches while remaining labeled as whole-album findings. Results SHALL have deterministic ordering and bounded pages.

#### Scenario: Reused photo and multiple findings
- **WHEN** the same media filename occurs in two albums and one occurrence has two findings
- **THEN** that occurrence has one row with two findings and the other occurrence remains independently addressable

#### Scenario: Multi-place album
- **WHEN** an album spans several places and matches the selected place
- **THEN** its tag opportunity appears once as a whole-album finding with multi-place context
- **AND** the inbox does not attribute its entire tag deficit to the selected place

### Requirement: Exact editor navigation and return

Opening a photo finding SHALL select only its exact gallery/album/item in the Album Editor, clear prior bulk selection, and preserve a local inbox return destination with filters and position. Missing or ambiguous targets SHALL show a notice rather than select another item. Existing album-only links SHALL remain valid.

#### Scenario: Review and return
- **WHEN** the owner opens a finding from a filtered inbox and returns after editing
- **THEN** the editor addresses only the identified item and the inbox restores the prior filters and row position
- **AND** if the row has resolved, the return falls back to its place group

#### Scenario: Source item removed
- **WHEN** the linked item no longer exists or cannot be identified uniquely
- **THEN** the editor explains that the target is unavailable and stages no change

### Requirement: Suggestions require acceptance and explicit saving

Scans and page navigation MUST NOT modify XML or media. A suggestion SHALL expose its original value, candidate, and evidence. Only an unambiguous source-field replacement SHALL support acceptance into the addressed item's pending edits; ambiguous candidates SHALL require manual editing. Acceptance SHALL NOT save XML, affect a bulk selection, or mark a finding resolved. The owner SHALL explicitly save through the editor.

#### Scenario: Accept a correction
- **WHEN** the owner accepts a supported spelling correction
- **THEN** only the identified field on the identified item is staged
- **AND** persisted XML and media remain unchanged until an explicit save

#### Scenario: Uncertain candidate
- **WHEN** several replacements or source components remain plausible
- **THEN** the owner sees the candidates and evidence but no automatic application occurs

### Requirement: Stale edits and verified resolution

Inbox suggestions SHALL be checked against current source values before staging. Inbox-originated saves SHALL require the source revision read by the editor and reject a revision mismatch without overwriting newer metadata. A successful save SHALL request rechecking; a finding SHALL resolve only when fresh analysis confirms its condition no longer holds. Leaving without saving SHALL leave the finding open.

#### Scenario: Source changed since analysis or editing
- **WHEN** indexed source values differ before acceptance, or the album revision changes before save
- **THEN** stale staging or saving is blocked respectively, with a refresh/review action
- **AND** newer persisted metadata is not replaced by the stale proposal

#### Scenario: Saved fix awaiting analysis
- **WHEN** an explicit save succeeds but rechecking has not completed
- **THEN** the finding is shown as awaiting verification
- **AND** it disappears only after successful analysis verifies the condition is resolved

### Requirement: Admin-only compatibility

The inbox and its private findings SHALL be available only in explicitly enabled local-admin operation. Hosted operation SHALL NOT expose the local index or run scanner controls. Existing Critical-tag coverage, public viewing/filtering, XML schema, canonical filenames, MCP, and classifier behavior SHALL remain compatible.

#### Scenario: Hosted deployment
- **WHEN** the app runs without local-admin configuration
- **THEN** private inbox data and scan controls are unavailable and no scan starts
- **AND** existing public pages retain their behavior
