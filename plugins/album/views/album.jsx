const React = require('react');

const Thumb = require('./thumb.jsx');

function Album({ album }) {
  const thumbs = album.item.map((item) => {
    const thumb = {};
    thumb.path = `/static/gallery-dan/media/thumbs/2016/${item.filename[0]}`; // todo move this to templatePrepare

    return <Thumb key={item.$.id} item={thumb} />;
  });

  return <ul>{thumbs}</ul>;
}

Album.propTypes = {
  album: React.PropTypes.shape({
    item: React.PropTypes.arrayOf(React.PropTypes.shape({
      $: React.PropTypes.shape({
        id: React.PropTypes.string,
      }),
    })),
  }),
};

module.exports = Album;
