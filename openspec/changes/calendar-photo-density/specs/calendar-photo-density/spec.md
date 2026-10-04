## Purpose

Help people identify dates with more gallery photos through calendar squares that share the map cluster colour scale, while preserving accessible date navigation.

## ADDED Requirements

### Requirement: Count photos by calendar date

The calendar SHALL aggregate counts by month/day across all years in the selected gallery, using the same date resolution and item population as the unfiltered Today destination. Density SHALL mean item count, including videos already shown by Today, rather than views, likes, or engagement.

#### Scenario: Multiple years and albums
- **WHEN** the gallery contains two items dated January 5 in one year and three items dated January 5 in another year across multiple albums
- **THEN** January 5 has a count of five, equal to its unfiltered Today result count
- **AND** items from other galleries do not affect that count

#### Scenario: Leap day and empty dates
- **WHEN** the calendar is displayed
- **THEN** all 366 possible month/day dates remain present, including February 29
- **AND** dates without matching items have a count of zero

### Requirement: Use the map cluster density colours

Each populated date SHALL have a square background using colours from the shared map cluster palette. Calendar thresholds SHALL scale to the selected gallery’s maximum daily count across all months. The top threshold SHALL be the maximum rounded down to two significant digits (or the exact integer below 100), so the busiest date always uses the top colour. Up to seven distinct integer thresholds SHALL span from one to that top threshold at evenly spaced intervals, rounded down. Small galleries SHALL use fewer bands to avoid duplicate or empty ranges, sampling the palette from first to last colour; a maximum of one SHALL use only the top colour. Empty galleries SHALL display only the neutral zero legend entry. The legend and date fills SHALL use the same scale. The map’s thresholds SHALL remain unchanged.

#### Scenario: Gallery with a maximum of 347
- **WHEN** the busiest date has 347 photos
- **THEN** the top legend band reads `340+` and that date uses the top palette colour
- **AND** other dates use the same gallery-wide scale

#### Scenario: Small and empty galleries
- **WHEN** the maximum daily count is two
- **THEN** the legend has zero, one, and `2+` bands with distinct thresholds
- **WHEN** the gallery has no photos
- **THEN** only the neutral zero band is shown

#### Scenario: No photos or blank table slot
- **WHEN** a date has zero photos or a table slot does not represent a date
- **THEN** it has no density colour and is not a link
- **AND** zero-count dates keep a visible day number while blank slots remain blank

### Requirement: Explain density accessibly

The calendar SHALL display a compact legend with a neutral zero state and labelled count ranges for every active colour band, and explain that counts cover all years. Populated dates SHALL expose the date and exact count in accessible link names and visible information on hover and keyboard focus. Date numerals SHALL meet at least 4.5:1 contrast against their backgrounds. Focus, hover, and visited styles SHALL preserve the density fill and provide a distinct interaction cue.

#### Scenario: Discover count without interpreting colour
- **WHEN** a user hovers over or focuses a date with 50 items
- **THEN** the exact count and date are visible
- **AND** assistive technology can identify the date, count, and navigation purpose

#### Scenario: Read the scale on a narrow screen
- **WHEN** the calendar is viewed on a narrow viewport
- **THEN** the legend ranges remain readable without horizontal page overflow
- **AND** date numbers and keyboard focus indicators remain legible in every colour band

### Requirement: Preserve calendar navigation

The calendar SHALL retain the existing twelve-month layout, January 1 Monday alignment, and links to the selected gallery's Today page using the `day=MM-DD` query parameter.

#### Scenario: Open a populated date
- **WHEN** a user activates January 5 on `/demo/calendar`
- **THEN** navigation opens `/demo/today?day=01-05`
- **AND** the unfiltered destination contains the same number of items represented by the calendar count for the same gallery data snapshot
