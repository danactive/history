## Purpose

Document the current deterministic mapping from History album filenames to
filesystem-backed media paths and the established public and administrative
ways those paths are used.

## ADDED Requirements

### Requirement: Filename-derived raster media paths

For a gallery and an album item's stored filename, the system SHALL derive the
existing original, photo, and thumbnail paths beneath
`/galleries/<gallery>/media/{originals,photos,thumbs}/<year>/`. Raster
filenames SHALL retain a `.jpg` or `.jpeg` extension and SHALL otherwise
use a `.jpg` extension. The year directory SHALL use the text preceding the
first hyphen in that raster filename, or `false` when there is no hyphen.

#### Scenario: Deriving a JPEG photo path

- **WHEN** the gallery is `demo` and an item filename is `2024-07-12-lake.jpg`
- **THEN** its photo path is `/galleries/demo/media/photos/2024/2024-07-12-lake.jpg`

#### Scenario: Normalizing a non-JPEG raster filename

- **WHEN** an item filename has a non-JPEG extension
- **THEN** each derived raster path uses the same basename with a `.jpg` extension

#### Scenario: Deriving a path without a year prefix

- **WHEN** an item filename contains no hyphen
- **THEN** the derived raster path uses the `false` directory

### Requirement: Filename-derived video paths

For every filename associated with an item, the system SHALL derive its video
path beneath `/galleries/<gallery>/media/videos/<year>/` without changing
that filename's extension. A video item's primary playable media path SHALL be
the first derived video path.

#### Scenario: Deriving a video path

- **WHEN** the gallery is `demo` and a video filename is `2024-07-12-walk.mp4`
- **THEN** its derived video path is `/galleries/demo/media/videos/2024/2024-07-12-walk.mp4`

#### Scenario: Selecting a video item's playable path

- **WHEN** a video item has one or more derived video paths
- **THEN** its primary media path is the first derived video path

### Requirement: Direct path rendering

The media paths returned by the existing helpers SHALL remain direct,
application-relative `/galleries/...` URLs. Non-admin pages SHALL render the
path selected for their current view without a new proxy, token, or path
translation layer; thumbnail rendering may continue to use the configured
image component.

#### Scenario: Browsing a collection

- **WHEN** a non-admin collection view renders an item's thumbnail
- **THEN** it uses the item's derived thumbnail URL through the existing image-rendering path

#### Scenario: Viewing an image or video

- **WHEN** a non-admin viewer renders selected media
- **THEN** it uses the existing direct photo URL for an image or direct video URL with its photo poster for a video

### Requirement: Local administrative media operations

The admin Album editor SHALL continue to read album XML locally and generate
an exportable XML representation of its edits without automatically writing the
file. It SHALL offer a separate explicit action to save that generated XML to
the selected local album XML file. Thumbnail framing SHALL continue to receive
a selected local originals folder, read the corresponding resized photo from
the local filesystem, and write the cropped thumbnail to the local thumbnails
folder without writing through a public media URL.

#### Scenario: Generating an export without saving

- **WHEN** an administrator generates XML from edits in the Album editor
- **THEN** the generated XML remains available for export and the local album
  XML file is unchanged

#### Scenario: Saving generated album XML

- **WHEN** an administrator explicitly saves generated XML for a selected
  gallery and album
- **THEN** the system replaces only that local album XML file with the exact
  generated XML and reports that the save succeeded

#### Scenario: Rejecting invalid XML

- **WHEN** an XML save request is malformed or is not a well-formed album
  document
- **THEN** the system reports the failure and leaves the existing local album
  XML file unchanged

#### Scenario: Framing a thumbnail

- **WHEN** an administrator saves a thumbnail crop for a selected resized photo
- **THEN** the system writes the generated thumbnail beside the existing local derivatives and leaves the album XML unchanged

### Requirement: Viewing does not mutate media metadata

Rendering or inspecting a derived media path SHALL not modify the item's album
XML or original media file.

#### Scenario: Rendering an existing item

- **WHEN** a user views an image, video, or thumbnail
- **THEN** the item's XML and original file remain unchanged
