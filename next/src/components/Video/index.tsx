import type { Filesystem } from '../../lib/filesystems'
import type { Item } from '../../types/common'

function Source(
  { extension, src }:
  { extension: Filesystem['ext'], src: Filesystem['path'] },
) {
  let type = ''
  if (extension === 'mp4') {
    type = 'video/mp4; codecs="avc1.4D401E, mp4a.40.2"'
  }

  if (extension === 'webm') {
    type = 'video/webm; codecs="vp8, vorbis"'
  }

  if (extension === 'ogv') {
    type = 'video/ogg; codecs="theora, vorbis"'
  }

  return <source src={src} type={type} />
}

function VideoPlayerHtml5(
  {
    extension, poster, src, description,
  }:
  {
    extension: Filesystem['ext'],
    poster: Item['filename'][0],
    src: Item['filename'][0],
    description: Item['description'],
  },
) {
  return (
    <>
      {description && <span className="image-gallery-description">{description}</span>}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        poster={poster}
        controls
        autoPlay={false}
        className="image-gallery-image"
      >
        <Source extension={extension} src={src} />
      </video>
    </>
  )
}

export default VideoPlayerHtml5
