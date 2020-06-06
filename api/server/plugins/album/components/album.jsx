const React = require('react');

const Thumb = require('./thumb.jsx');

function Album({ album }) {
  const thumbs = album.items.map((item) => <Thumb key={item.$.id} item={item} />);

  return (
    <ul>
      {thumbs}
    </ul>
  );
}

module.exports = Album;
