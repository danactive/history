const propTypes = require('prop-types');
const React = require('react');

const Thumb = require('./thumb.jsx');

function Album({ album }) {
  const thumbs = album.items.map(item => <Thumb key={item.$.id} item={item} />);

  return <ul>{thumbs}</ul>;
}

Album.propTypes = {
  album: propTypes.shape({
    items: propTypes.arrayOf(propTypes.shape({
      $: propTypes.shape({
        id: propTypes.string
      })
    })).isRequired
  }).isRequired
};

module.exports = Album;
