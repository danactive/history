## Purpose

Make enabled photo map filters shareable through stable geographic query parameters without affecting ordinary map browsing or the Visited page.

## ADDED Requirements

### Requirement: Geographic URL state requires an enabled Map Filter
Photo map pages SHALL read and publish geographic URL state only while Map Filter is enabled. Valid bbox SHALL enable filtering on direct load. Longitude, latitude, and zoom without valid bbox SHALL NOT enable filtering or override normal photo camera behavior.

#### Scenario: Ordinary browsing
- **WHEN** Map Filter is off and the user pans, zooms, expands a cluster, or selects another photo
- **THEN** the application does not write geographic query parameters
- **AND** normal camera navigation continues even if standalone camera parameters were present in the incoming URL

### Requirement: Shared filtered camera contract
With valid bbox, photo maps SHALL restore a complete valid longitude/latitude pair and optional zoom; otherwise they SHALL fit the saved bbox. Coordinates SHALL be finite decimal values, longitude in [-180, 180] and latitude in [-90, 90], accepting zero. Invalid, blank, duplicate, or incomplete pairs SHALL be ignored together. Zoom SHALL accept one finite decimal in [0, 22] or fall back to the page default.

#### Scenario: Reopen filtered coordinates
- **WHEN** a photo map loads `longitude=0&latitude=0&zoom=8&bbox=-1,-1,1,1`
- **THEN** filtering is enabled and the saved center and zoom are restored
- **AND** the same values work on another photo map page within that page dataset

#### Scenario: Legacy or malformed camera
- **WHEN** a valid bbox link has no usable coordinate pair
- **THEN** the map fits that bbox and keeps filtering enabled

### Requirement: Publish enabled filter changes after settling
Enabling Map Filter SHALL immediately publish bbox and camera together. While enabled, map movement SHALL publish after a 300 ms trailing debounce following movement end; resumed movement SHALL cancel the prior timer. Publications SHALL replace history, preserve unrelated query parameters and hash, skip equivalent values, and refresh server-bounded results and counts. Coordinates SHALL serialize to at most six decimal places, zoom to three, with normalized negative zero and wrapped longitude.

#### Scenario: Resumed gesture
- **WHEN** another gesture starts less than 300 ms after a filtered map settles
- **THEN** the earlier publication is canceled
- **AND** only the final settled state is published after the new debounce

#### Scenario: Move beyond initial bounds
- **WHEN** a page loaded with bbox A is panned to disjoint bbox B while filtering
- **THEN** results and counts include matches in B that were excluded from the initial server response

#### Scenario: World copies and dateline
- **WHEN** a filtered viewport spans the world or crosses the dateline
- **THEN** its canonical bbox uses valid latitude limits and the compatible [-180, 180] longitude interval
- **AND** local and shared results use the same interval

### Requirement: Clear removes geographic query state
Disabling Map Filter, removing its filter chip, or Clear all SHALL cancel pending publication and remove bbox, longitude, latitude, and zoom. Later unfiltered movement SHALL NOT recreate these parameters. Other search and selection clear semantics SHALL remain compatible.

#### Scenario: Clear before publication
- **WHEN** the user clears filtering during the debounce
- **THEN** all four geographic parameters are removed and the old timer cannot restore them
- **AND** results recover beyond the old server bounds and normal photo camera follow resumes

### Requirement: Restoration and navigation do not cause feedback
Filtered URL restoration, style loading, and resize SHALL NOT replace saved bbox with aspect-ratio-adjusted bounds. External navigation and Back/Forward SHALL cancel stale publication and restore the destination filtered state when applicable. Unmounting SHALL cancel pending writes.

#### Scenario: Different screen dimensions
- **WHEN** a filtered URL is opened at another aspect ratio
- **THEN** its exact saved bbox remains applied without a corrective URL write

#### Scenario: Return to an unfiltered URL
- **WHEN** browser navigation removes bbox
- **THEN** filtering becomes disabled and camera-only parameters are ignored
- **AND** pending filtered updates cannot overwrite the destination URL

### Requirement: Visited page is excluded
The Visited page SHALL neither restore nor publish geographic query state. Its country navigation and ordinary map controls SHALL retain their existing independent behavior.

#### Scenario: Visited with geographic parameters
- **WHEN** Visited opens a URL containing longitude, latitude, zoom, or bbox and the user navigates its map
- **THEN** its camera follows the existing country behavior and controls
- **AND** the page does not apply or rewrite those parameters
