const React = require('react');

const Thumb = require('./thumb.jsx');

function Album({ album }) {
  const thumbs = album.item.map((item) => {
    const thumb = {};
    thumb.caption = item.thumb_caption && item.thumb_caption[0];
    thumb.city = item.photo_city && item.photo_city[0];
    thumb.description = item.photo_desc && item.photo_desc[0];
    thumb.location = item.photo_loc && item.photo_loc[0];
    thumb.path = `/static/gallery-dan/media/thumbs/2016/${item.filename[0]}`;

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
