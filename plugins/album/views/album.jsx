const React = require('react');

const Thumb = require('./thumb.jsx');

function Album({ album }) {
  const thumbs = album.items.map(item => <Thumb key={item.$.id} item={item} />);

  return <ul>{thumbs}</ul>;
}

Album.propTypes = {
  album: React.PropTypes.shape({
    item: React.PropTypes.arrayOf(React.PropTypes.shape({
      $: React.PropTypes.shape({
        id: React.PropTypes.string,
      }),
    })).isRequired,
  }).isRequired,
};

module.exports = Album;
