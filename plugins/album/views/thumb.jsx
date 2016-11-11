const React = require('react');

function Thumb({ item }) {
  return (<li className="liAlbumPhoto">
    <div className="albumBoxPhotoImg"><a rel="set"><img src={item.path} alt={item.caption} /></a></div>
    <div className="albumBoxPhotoCaption">{item.caption}</div>
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
