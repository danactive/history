const React = require('react');

class Thumb extends React.Component {
  constructor(props) {
    super(props);

    // Set up initial state
    this.state = {
      item: props.item,
    };
  }

  render() {
    return <li>{this.state.item.filename[0]}</li>;
  }
}

Thumb.propTypes = {
  item: React.PropTypes.shape({
    filename: React.PropTypes.arrayOf(React.PropTypes.string.isRequired),
  }),
};

module.exports = Thumb;
