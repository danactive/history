const React = require('react');

function Thumb({ item }) {
  return (<li className="liAlbumPhoto">
    <div className="albumBoxPhotoImg"><a href={item.path} rel="set"><img src={item.path} alt={item.caption} /></a></div>
    <div className="albumBoxPhotoCaption">{item.caption}</div>
  </li>);
}

Thumb.propTypes = {
  item: React.PropTypes.shape({
    caption: React.PropTypes.string,
    path: React.PropTypes.string.isRequired,
  }),
};

module.exports = Thumb;
