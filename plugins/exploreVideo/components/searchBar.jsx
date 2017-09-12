/* global URL, window */

const propTypes = require('prop-types');
const React = require('react');

class SearchBar extends React.Component {
  static getQS() {
    return (typeof URL === 'undefined') ? '' : new URL(window.location.href).search;
  }

  // output sample '49.25,-123.1' or ''
  static getGeoCode(qs) {
    const matches = /(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/.exec(qs);
    return (matches) ? matches[0] : '';
  }

  static get defaults() {
    return {
      geocode: '13.7524000,100.5021833',
      instruction: 'Keyword or GeoCode'
    };
  }

  constructor(props) {
    super(props);

    const geocode = SearchBar.getGeoCode(SearchBar.getQS());
    const searchValue = geocode || SearchBar.defaults.geocode;
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
    return (
      <section id="search-bar">
        <input
          onChange={event => this.onInputChange(event.target.value)}
          placeholder={SearchBar.defaults.instruction}
          title={SearchBar.defaults.instruction}
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
