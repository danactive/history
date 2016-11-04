const React = require('react');

class Listing extends React.Component {
  constructor(props) {
    super(props);

    // Set up initial state
    this.state = {
      hello: props.initialValue || 'placeholder',
    };
  }

  render() {
    return <div>{this.state.hello}</div>;
  }
}

Listing.propTypes = {
  initialValue: React.PropTypes.string.isRequired,
};

module.exports = Listing;
