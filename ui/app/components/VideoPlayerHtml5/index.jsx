import React, { memo } from 'react';

function VideoPlayerHtml5({ extension, poster, src }) {
  function Source() {
    let type = '';
    if (extension === 'mp4') {
      type = 'video/mp4; codecs="avc1.4D401E, mp4a.40.2"';
    }

    if (extension === 'webm') {
      type = 'video/webm; codecs="vp8, vorbis"';
    }

    if (extension === 'ogv') {
      type = 'video/ogg; codecs="theora, vorbis"';
    }

    return <source src={src} type={type} />;
  }

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      poster={poster}
      controls
      autoPlay={false}
      className="image-gallery-image"
    >
      <Source extension={extension} />
    </video>
  );
}

export default memo(VideoPlayerHtml5);
