/* global URL, window */

const propTypes = require('prop-types');
const React = require('react');

class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    const geocode = /(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/.exec(new URL(window.location.href).search)[0];
    const searchValue = geocode || '13.7524000,100.5021833';
    this.state = { searchValue };
  }

  componentDidMount() {
    this.props.onSearchChange(this.state.searchValue);
  }

  onInputChange(searchValue) {
    this.changeInputValue(searchValue);
    this.props.onSearchChange(searchValue);
  }

  changeInputValue(searchValue) {
    this.setState({ searchValue });
  }

  render() {
    const instruction = 'Keyword or GeoCode';
    return (
      <section id="search-bar">
        <input
          onChange={event => this.onInputChange(event.target.value)}
          placeholder={instruction}
          title={instruction}
          value={this.state.searchValue}
        />
      </section>
    );
  }
}

SearchBar.propTypes = {
  onSearchChange: propTypes.func.isRequired
};

module.exports = SearchBar;
