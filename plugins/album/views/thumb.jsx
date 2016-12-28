const React = require('react');

function Thumb({ item }) {
  const title = [];

  if (item.photoCity) {
    title.push(item.photoCity);
  }

  if (item.ref) {
    if (item.ref.source === 'wikipedia') {
      title.push(`<a href='https://en.wikipedia.org/wiki/${item.ref.name}' target='_blank'>Wiki</a>`);
    }
  }

  return (<li className="liAlbumPhoto">
    <div className="albumBoxPhotoImg">
      <a href={item.mediaPath} rel="set" title={title.join(' | ')}>
        <img src={item.thumbPath} alt={item.thumbCaption} title={item.caption} />
      </a>
    </div>
    <div className="albumBoxPhotoCaption">{item.thumbCaption}</div>
  </li>);
}

Thumb.propTypes = {
  item: React.PropTypes.shape({
    caption: React.PropTypes.string,
    thumbCaption: React.PropTypes.string.isRequired,
    thumbPath: React.PropTypes.string.isRequired,
    mediaPath: React.PropTypes.string.isRequired,
  }),
};

Thumb.defaultProps = {
  item: {
    caption: 'Thumbnail',
  },
};

module.exports = Thumb;
