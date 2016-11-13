const React = require('react');

function Thumb({ item }) {
  return (<li className="liAlbumPhoto">
    <div className="albumBoxPhotoImg"><a href={item.photoPath} rel="set"><img src={item.thumbPath} alt={item.caption} /></a></div>
    <div className="albumBoxPhotoCaption">{item.caption}</div>
  </li>);
}

Thumb.propTypes = {
  item: React.PropTypes.shape({
    caption: React.PropTypes.string,
    thumbPath: React.PropTypes.string.isRequired,
    photoPath: React.PropTypes.string.isRequired,
  }),
};

module.exports = Thumb;
