## Purpose

Define how users browse a gallery's photos by person and age while keeping search, map scope, displayed results, and counts consistent when filters change or are cleared.

## ADDED Requirements

### Requirement: Gallery-scoped browsing and count meanings

The page at `/{gallery}/persons` SHALL display photos from the requested gallery. With no active filters, it SHALL offer All ages and All persons. The All persons count SHALL represent distinct named people in the current person-menu scope, while photo counts SHALL count photos rather than sum person appearances. Photos without person metadata SHALL remain eligible when no person or age filter excludes them.

#### Scenario: Open an unfiltered gallery
- **GIVEN** a gallery with N photos and P distinct named people
- **WHEN** the user opens its persons page with no query or map bounds
- **THEN** the page shows N photos and All persons (P persons), with singular labels where appropriate
- **AND** photos without named people contribute to the photo total but not the person count

#### Scenario: A photo contains multiple people
- **WHEN** one matching photo contains two named people
- **THEN** it contributes one photo to the displayed photo count and one appearance to each person's photo count

### Requirement: Person selection and contextual options

The person menu SHALL list named people and their photo counts from the remaining search/map scope, constrained by the selected age when present. Selecting one person SHALL restrict results to photos containing that person without removing other eligible people from the menu. Options SHALL be ordered by descending photo count, with name order breaking ties.

#### Scenario: Select a person
- **GIVEN** Casey Example has 2 matching photos in a synthetic scope containing 3 people
- **WHEN** the user selects Casey Example
- **THEN** the results show the 2 matching photos
- **AND** the menu retains the other eligible people and All persons (3 persons)

#### Scenario: Person options at a selected age
- **GIVEN** a photo contains Alice aged 21 and Bob aged 42
- **WHEN** the selected age is 21
- **THEN** that photo contributes to Alice's person-menu count but not Bob's
- **AND** Bob appears only if another photo in scope shows Bob aged 21

### Requirement: Contextual age filtering

The age menu SHALL offer All ages, available nonnegative integer ages in ascending order, and Unknown age when people lack dates of birth. Unknown age SHALL precede numeric ages. Age option counts SHALL count each matching photo once per age; All ages SHALL count photos in the remaining scope without the selected age constraint. With a selected person, age matching and counts SHALL refer to that person at the photo date.

#### Scenario: Age and person must match the same person
- **GIVEN** a photo contains Alice aged 21 and Bob aged 42
- **WHEN** Alice and age 42 are selected
- **THEN** the photo is excluded even though Bob is 42

#### Scenario: Multiple people share an age
- **GIVEN** one photo shows two people aged 21
- **WHEN** no person is selected
- **THEN** the age 21 option counts that photo once

#### Scenario: Unknown age
- **GIVEN** a named person has no date of birth
- **WHEN** that person and Unknown age are selected
- **THEN** their photos in the remaining scope are eligible

#### Scenario: Switching ages retains alternatives
- **WHEN** the user selects an available age for a person
- **THEN** other available ages for that person remain in the age menu

### Requirement: Reversible filter clearing

Clearing a person filter SHALL restore all photos and person options eligible under the remaining constraints. Clearing age alone SHALL retain the person constraint. Clearing all filters SHALL restore the unfiltered gallery scope. A previous displayed result MUST NOT permanently narrow later results or counts, including after client navigation completes or the sequence is repeated.

#### Scenario: Clear the person selection
- **GIVEN** an unchanged synthetic gallery initially shows 3 persons and 6 photos with no filters
- **WHEN** the user selects Casey Example and then clicks Clear in the shared search controls
- **THEN** after the route update completes the page again shows 3 persons and 6 photos
- **AND** repeating the sequence does not reduce either count

#### Scenario: Clear only person while retaining constraints
- **GIVEN** country Canada, age 21, and a person are selected
- **WHEN** the person is cleared using All persons or its active-filter removal action
- **THEN** the page shows all eligible people and photos at age 21 in Canada
- **AND** any active map bounds remain applied

#### Scenario: Clear only age
- **WHEN** the user chooses All ages while a person is selected
- **THEN** all ages for that person become eligible within the remaining search/map scope

### Requirement: Canonical and restorable URL state

The page SHALL represent explicit person and age filters as `person:` and `age:` terms in the shared `query` parameter, and map bounds in `bbox`. Control updates SHALL preserve unrelated query terms and URL parameters. A direct visit, refresh, or completed history navigation SHALL restore the filters represented by the URL. Invalid age terms SHALL be removed without discarding valid remaining filters. Advanced boolean expressions SHALL retain their shared search meaning and SHALL NOT be flattened into a different conjunction by page controls.

#### Scenario: Open a person and age bookmark
- **WHEN** the user opens `/{gallery}/persons?query=person%3A%22Casey%20Example%22%20%26%26%20age%3A21`
- **THEN** the person and age controls reflect Casey Example and 21 and the results satisfy both

#### Scenario: Invalid age in an otherwise valid query
- **WHEN** the URL contains a negative or nonnumeric age term alongside a valid person term
- **THEN** the invalid age term is removed from the canonical URL
- **AND** the valid person constraint is retained

### Requirement: Shared search and person details

The persons page SHALL support the shared search controls and active-filter removal. A structured person selection SHALL select that person; a tag selection SHALL retain tag semantics. An unambiguous person inferred from free text SHALL provide the contextual person-details link. The link SHALL target the same gallery and encode the person's name in the `person` parameter.

#### Scenario: Unique partial name
- **GIVEN** Alice Example is the only person matching the free text `ali`
- **WHEN** the user searches for `ali`
- **THEN** the page offers a person-details link for Alice Example in the current gallery

#### Scenario: Structured tag selection
- **WHEN** the user selects a tag search option
- **THEN** the page applies a tag search without treating it as a selected person

### Requirement: Map bounds compose with person and age filters

Enabled map bounds SHALL constrain results and contextual menu counts together with search, person, and age selections. Clearing only a person SHALL retain those bounds; clearing the map filter SHALL restore the geographic scope permitted by the other filters. Hiding the map SHALL control its visibility without changing the filter semantics.

#### Scenario: Clear person within map bounds
- **GIVEN** an enabled map contains Alice and Bob while Carol has photos only outside its bounds
- **WHEN** the user selects Alice and then clears only the person filter
- **THEN** Alice and Bob are eligible in the restored menu and Carol remains excluded

### Requirement: Consistent results and recovery

The photo summary, thumbnail list, and photo viewer SHALL use the same final filtered result. Selection through a thumbnail SHALL select the corresponding photo in the viewer. When no photos match, the page SHALL show an empty-results message and, if a person or age is selected, a Reset age/person filters action that clears both while preserving other search and map constraints.

#### Scenario: Empty person and age combination
- **WHEN** a person and age combination has no matching photos
- **THEN** the photo count is zero and the page shows No photos match the current filters
- **AND** Reset age/person filters clears both selections together and restores the remaining scope

#### Scenario: Choose a filtered thumbnail
- **WHEN** the user selects a thumbnail in the filtered results
- **THEN** the viewer opens that same photo within the filtered result set
