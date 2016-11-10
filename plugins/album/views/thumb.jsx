const React = require('react');

function thumbCaption(item) {
  if (!item.location && !item.city && !item.description) {
    return `${item.location} (${item.city}): ${item.description}`;
  }
  if (!item.location && !item.city && item.description) {
    return `${item.location} (${item.city})`;
  }
  if (!item.location && item.city && !item.description) {
    return `${item.location}: ${item.description}`;
  }
  if (item.location && !item.city && !item.description) {
    return `${item.city}: ${item.description}`;
  }
  if (!item.location) {
    return item.location;
  }
  if (!item.city) {
    return item.city;
  }

  return item.description;
}

function Thumb({ item }) {
  const caption = thumbCaption(item);

  return (<li className="liAlbumPhoto">
    <div className="albumBoxPhotoImg"><a rel="set"><img src={item.path} alt={caption} /></a> {caption}</div>
  </li>);
}

Thumb.propTypes = {
  item: React.PropTypes.shape({
    caption: React.PropTypes.string,
    city: React.PropTypes.string,
    description: React.PropTypes.string,
    location: React.PropTypes.string,
    path: React.PropTypes.string.isRequired,
  }),
};

module.exports = Thumb;
