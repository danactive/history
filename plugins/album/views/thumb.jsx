const React = require('react');

function Thumb({ item }) {
  return <li>{item.filename[0]}</li>;
}

Thumb.propTypes = {
  item: React.PropTypes.shape({
    filename: React.PropTypes.arrayOf(React.PropTypes.string.isRequired),
  }),
};

module.exports = Thumb;
