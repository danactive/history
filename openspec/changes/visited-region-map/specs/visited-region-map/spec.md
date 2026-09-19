## Purpose

Give the visited country list geographic context through a persistent map that follows the reader and identifies visited administrative regions in Japan, USA, Canada, and Mexico.

## ADDED Requirements

### Requirement: Persistent desktop map panel

The visited page SHALL display a Mapbox panel to the right of the scrolling list on desktop when the gallery contains a supported country. This capability targets the desktop web app; mobile layouts are outside its scope.

#### Scenario: Desktop scrolling
- **WHEN** the user scrolls the visited country list on desktop
- **THEN** the map remains visible at the right while list content moves

#### Scenario: No supported countries
- **WHEN** no visits to Japan, USA, Canada, or Mexico exist in the gallery
- **THEN** the page displays its list without an empty map panel

### Requirement: Country selection follows the reading position

The map SHALL select the latest supported country heading at or above a reading line near the top of the unobscured list area. Before any supported heading reaches that line, it SHALL select the first supported country in list order. It SHALL retain the selected country while unsupported countries pass the reading line and SHALL recompute selection when scrolling backward or restoring a scroll position.

#### Scenario: Heading reaches the reading line
- **WHEN** USA reaches the reading line after Canada
- **THEN** the map pans to USA and updates its title and summary while retaining all four countries' overlays and the current zoom

#### Scenario: Reverse scrolling
- **WHEN** USA moves below the reading line while scrolling back toward Canada
- **THEN** the map returns to Canada

#### Scenario: Unsupported country between supported countries
- **WHEN** an unsupported country's heading passes the reading line after Canada and before USA
- **THEN** the panel remains clearly labeled Canada without moving the camera or changing any overlays

#### Scenario: Restored position
- **WHEN** the page loads with Japan as the latest supported heading above the reading line
- **THEN** the map selects Japan without requiring an additional scroll

### Requirement: Visited administrative coverage

The map SHALL distinguish visited regions with visible vector outlines and subtle fills, show their distinct count, and leave unvisited divisions visually neutral. Coverage SHALL include all 47 Japanese prefectures, 50 US states and DC, 13 Canadian provinces and territories, and 31 Mexican states plus Mexico City. All four countries' vector overlays SHALL remain present independently of the active country once their resources load; features on the visible hemisphere within the viewport SHALL remain visible during and after panning. The active country SHALL determine the displayed summary without filtering overlay visibility. Highlighting SHALL use the gallery's existing region visits regardless of photo-count search thresholds.

#### Scenario: Japan coverage
- **WHEN** the gallery contains visits to Kyoto and Osaka and Japan is selected
- **THEN** their prefecture boundaries are highlighted and counted once each

#### Scenario: Noncontiguous states
- **WHEN** USA is selected and Hawaii or Alaska has been visited
- **THEN** those states receive the same visited treatment as mainland states and can be inspected on the map

#### Scenario: No matching regional visits
- **WHEN** a supported country has no matched regional visits
- **THEN** the panel shows zero visited regions without marking the entire country as visited

### Requirement: Reliable region-name matching

The system SHALL match known full names, postal abbreviations, ISO subdivision codes, accented names, and Japanese prefecture variants within each visit's country. Canonical names SHALL take precedence over aliases. Unknown or ambiguous names SHALL remain unhighlighted and be available in a visible unmapped-name disclosure. Multiple names identifying one division SHALL count only once.

#### Scenario: Canadian aliases
- **WHEN** visits contain BC, British Columbia, Québec, and CA-ON
- **THEN** British Columbia, Quebec, and Ontario are highlighted with a count of three

#### Scenario: Japanese variants
- **WHEN** visits contain Osaka, Kyōto Prefecture, Tokyo-to, and Kanagawa-ken
- **THEN** each resolves to its corresponding prefecture

#### Scenario: Washington ambiguity
- **WHEN** a US visit names Washington
- **THEN** Washington state is highlighted and DC is not highlighted through that alias

#### Scenario: Unknown location
- **WHEN** a US region name is Portland without a known state identifier
- **THEN** no state is inferred and Portland appears among unmapped names

### Requirement: Globe overview with automatic panning and manual zoom

The map SHALL explicitly select Mapbox Globe in both online and vector-only modes, matching the album maps, with a shared initial overview zoom and no automatic country-specific magnification. Country selection SHALL change only the camera center, preserving the current zoom, bearing, and pitch throughout the transition. The map SHALL permit manual panning and deliberate manual zoom through accessible controls, but SHALL NOT expose pitch or rotation interactions. It SHALL respect reduced-motion preferences and support mouse-wheel and double-click zoom over the map while wheel input over the list scrolls the page.

#### Scenario: Consistent projection and zoom
- **WHEN** the user scrolls from Canada to USA and then Japan
- **THEN** the map uses Globe and preserves the current zoom throughout each automatic pan, with no country-fitting or zoom-out/zoom-in flight

#### Scenario: Persistent vectors
- **WHEN** Canada and USA are both on the visible hemisphere within the viewport while Japan is the active country
- **THEN** both countries' boundaries and visited highlights remain rendered

#### Scenario: Globe horizon visibility
- **WHEN** a region moves behind the globe during a pan
- **THEN** its geometry remains loaded but its label and leader line are not visible or keyboard-focusable through the globe, and they return when its anchor becomes visible again

#### Scenario: Manual zoom persists
- **WHEN** the user zooms in with a zoom control and subsequently scrolls to another supported country
- **THEN** the map pans to that country at the manually chosen zoom and retains zero bearing and pitch

#### Scenario: Wheel scrolling
- **WHEN** the user scrolls the mouse wheel over the map
- **THEN** the map zooms without scrolling the page; wheel input over the left list continues to scroll the page

#### Scenario: Resize
- **WHEN** the desktop browser window is resized
- **THEN** the canvas resizes while retaining the current center, zoom, bearing, and pitch

#### Scenario: Reduced motion
- **WHEN** reduced motion is preferred and the selected country changes
- **THEN** the map changes view without an animated flight

### Requirement: Independent overlay loading and graceful failure

The map SHALL load boundaries for all four supported countries independently of scroll selection. Loading or failure SHALL preserve existing visit list content and links. A failed country load SHALL be identified without removing successfully loaded overlays or attributing their counts to the active country.

#### Scenario: Slow response after switching
- **WHEN** boundaries for Canada arrive after the user has selected Japan
- **THEN** Canada's overlays are added without replacing Japan's overlays or changing the active camera or country summary

#### Scenario: Partial boundary failure
- **WHEN** Canada's boundary request fails while USA and Japan have loaded
- **THEN** USA and Japan remain rendered and Canada's unavailable coverage is identified

#### Scenario: Boundary resource failure
- **WHEN** a local boundary load fails
- **THEN** that country's unavailable coverage is identified and country counts, years, and filter links remain usable

### Requirement: Offline vector-only display

When offline, the map SHALL display local administrative vectors, visited highlights, and region labels on a plain background without displaying Mapbox basemap tiles. Offline rendering SHALL require no remote tile, style, sprite, or font/glyph resources and SHALL work without a previously cached online basemap while the local application is reachable. Automatic pan-only navigation, manual zoom, Globe projection, and the current camera state SHALL be preserved. Basemap network failure SHALL trigger this fallback even if the browser reports online.

#### Scenario: Offline first load
- **WHEN** the local app is opened with no internet access and no cached Mapbox assets
- **THEN** local vectors and labels render without Mapbox tiles or remote rendering-resource requests

#### Scenario: Connectivity is lost
- **WHEN** the map enters offline mode after an online session
- **THEN** basemap tiles disappear, new basemap requests stop, and vectors and labels remain at the same camera position and zoom

#### Scenario: Internet unavailable on a connected local network
- **WHEN** the browser reports online but the basemap cannot be fetched
- **THEN** the map falls back to the local vector-only display rather than leaving a blank or indefinitely loading map

#### Scenario: Connectivity returns
- **WHEN** connectivity returns
- **THEN** the basemap is restored only if the user's Basemap preference is on, preserving vector highlights, labels, and the current camera state

### Requirement: Selectable basemap visibility

The map SHALL provide an accessible Basemap toggle. Turning it off SHALL render vectors and labels only, stop remote basemap rendering-resource requests, and preserve the camera. The preference SHALL persist across country and connectivity changes within the page session. Offline fallback SHALL override an on preference while clearly indicating basemap unavailability.

#### Scenario: Vector-only while online
- **WHEN** the user turns Basemap off while online
- **THEN** tiles disappear and vectors and labels remain without changing the camera or visited coverage

#### Scenario: Explicit off survives reconnect
- **WHEN** the user has turned Basemap off and connectivity is lost and restored
- **THEN** the map remains vector-only until the user turns Basemap on

#### Scenario: Keyboard operation
- **WHEN** the Basemap toggle is focused and activated with the keyboard
- **THEN** its state changes and is exposed to assistive technology

### Requirement: Centered administrative labels

Each prefecture, state, province, territory, and DC SHALL have one label, preferentially centered horizontally and vertically on a visual-center anchor within its main polygon. When centered full names collide, the map SHALL use abbreviations first, then nearby text with short leader lines back to the interior anchors if collisions remain. Labels SHALL be present for visited and unvisited divisions whenever their anchors are in the viewport and on the visible globe surface, independent of the active country. Full names SHALL be used when space permits, with recognizable abbreviations or unambiguous subdivision codes where necessary. The full name SHALL remain available on hover and keyboard focus. Labels SHALL render offline and SHALL NOT be silently omitted through collision suppression.

#### Scenario: Centered label
- **WHEN** a region is in view and its full label fits without collision
- **THEN** its text is centered on an interior anchor associated with that region, above its vector fill

#### Scenario: Small region
- **WHEN** a full name is too wide for the displayed region
- **THEN** a compact abbreviation or subdivision code is tried at the same anchor and the full name is available on hover and focus

#### Scenario: Abbreviations still collide
- **WHEN** abbreviated labels overlap in a dense group of prefectures or states
- **THEN** text is moved into nearby available space with short leader lines connecting it to each region's interior anchor, rather than silently hiding labels

#### Scenario: Label layout follows manual zoom
- **WHEN** the user changes zoom or resizes the map
- **THEN** label placement is recomputed, using centered full names where space now permits without changing the camera automatically

#### Scenario: Concave or island region
- **WHEN** a region has a centroid outside its boundary or comprises multiple islands
- **THEN** its single label uses a validated interior anchor in the main land polygon

#### Scenario: Offline labels persist
- **WHEN** the map switches between online and offline display or pans to another country
- **THEN** labels for all in-view divisions remain available without remote font requests

### Requirement: Active country indicator

The list SHALL indicate the country currently selected by scroll position with a subtle visible marker and an accessible current-state annotation. The indication SHALL follow automatic country selection without changing list order or filter links. Manual map panning SHALL NOT change the list's active country.

#### Scenario: Active heading changes
- **WHEN** USA replaces Canada as the active country
- **THEN** the list marker moves from Canada to USA and agrees with the map summary

### Requirement: Coverage totals

The summary SHALL display matched unique visited divisions out of the full supported division count for the active country. Denominators SHALL be 47 prefectures for Japan, 51 states / DC for USA, 13 provinces / territories for Canada, and 32 states / Mexico City for Mexico. Duplicate aliases SHALL count once and unmatched names SHALL NOT inflate coverage. Visited and unvisited regions SHALL differ in both fill treatment and outline prominence.

#### Scenario: Japanese coverage
- **WHEN** 30 unique Japanese prefectures are matched
- **THEN** the summary displays “30 of 47 prefectures visited”

#### Scenario: Explicit denominator scope
- **WHEN** USA or Canada is active
- **THEN** the summary makes inclusion of DC or territories explicit alongside the total

#### Scenario: Unavailable data
- **WHEN** the active country's boundary data has not loaded or has failed
- **THEN** the summary shows loading or unavailable status rather than reporting zero visits

### Requirement: Existing visit data and navigation remain compatible

The change SHALL preserve country ordering, displayed years and photo counts, and existing country/region filter URL behavior. Viewing the map SHALL NOT modify album XML or original media, or require classifier services.

#### Scenario: Existing photo-count link
- **WHEN** the user selects an existing country or region photo-count link
- **THEN** it opens the same gallery search filter as before the map was added


### Requirement: Mexico coverage and country aliases

Mexico SHALL support the same persistent vectors, labels, visited styling, coverage summary, pan-only selection, and offline behavior as Canada. Both Mexico and México country headings SHALL select the same dataset. Coverage SHALL contain 31 states plus Mexico City, with Mexico City distinct from the State of Mexico. Unknown city names SHALL remain unmapped.

#### Scenario: Accented country and state aliases
- **WHEN** México reaches the reading line with visits to State of Mexico, Mexico city, and Yucatan
- **THEN** Mexico is selected, those three divisions are highlighted and counted out of 32, and all other country sources remain loaded

#### Scenario: Repeated basemap changes
- **WHEN** the user repeatedly switches Basemap off and on while labels are visible
- **THEN** the same local label overlay remains mounted and updates with the camera independently of style-loading event order, without disappearing or duplicating labels


### Requirement: Location validation warnings

The visited page SHALL provide a discoverable validation section with country context for likely supported-country typos, unmapped or ambiguous supported regions, and duplicate normalized names or region aliases. Conservative spelling suggestions SHALL be informational only; they SHALL NOT highlight guessed matches or mutate metadata. Unsupported countries SHALL NOT be reported as invalid solely because their vectors are unavailable. Loading and failed boundary validation SHALL be distinguished from successful validation.

#### Scenario: Duplicate aliases
- **WHEN** a country contains both BC and British Columbia
- **THEN** validation flags duplicate aliases and map coverage counts British Columbia once

#### Scenario: Misspelled region
- **WHEN** Canada contains Ontaro
- **THEN** validation suggests Ontario without highlighting it automatically

#### Scenario: Duplicate country entries
- **WHEN** Mexico and México occur as separate country entries
- **THEN** validation flags the duplicate names and map coverage combines both entries' regional visits without changing the original list or filters
