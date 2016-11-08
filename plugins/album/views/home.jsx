const React = require('react');

const Thumb = require('./thumb.jsx');

class Album extends React.Component {
  constructor(props) {
    super(props);

    // Set up initial state
    this.state = {
      items: props.album.item,
    };
  }

  render() {
    const thumbs = this.state.items.map(item => <Thumb key={item.$.id} item={item} />);

    return <ul>{thumbs}</ul>;
  }
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
