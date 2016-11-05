const React = require('react');

class Album extends React.Component {
  constructor(props) {
    super(props);

    // Set up initial state
    this.state = {
      items: props.album.item || ['placeholder', '2', '3'],
    };
  }

  render() {
    const listItems = this.state.items.map(item => <li>{item.filename[0]}</li>);

    return <ul>{listItems}</ul>;
  }
}

Album.propTypes = {
  album: React.PropTypes.shape({
    item: React.PropTypes.arrayOf(),
  }),
};

module.exports = Album;
