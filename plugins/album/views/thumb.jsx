const React = require('react');

function Thumb({ item }) {
  return (<li className="liAlbumPhoto">
    <div className="albumBoxPhotoImg"><a rel="set"><img src={item.path} alt="Caption" /></a></div>
  </li>);
}

Thumb.propTypes = {
  item: React.PropTypes.shape({
    path: React.PropTypes.string.isRequired,
  }),
};

module.exports = Thumb;
