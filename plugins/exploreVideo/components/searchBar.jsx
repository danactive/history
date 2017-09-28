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
      instruction: 'Keyword or GeoCode',
      searchOrder: 'relevance'
    };
  }

  constructor(props) {
    super(props);

    const geocode = SearchBar.getGeoCode(SearchBar.getQS());
    const searchValue = geocode || SearchBar.defaults.geocode;
    const searchOrder = SearchBar.defaults.searchOrder;
    this.state = { searchValue, searchOrder };
  }

  componentDidMount() {
    this.props.onSearchChange(this.state.searchValue, { searchOrder: this.state.searchOrder });
  }

  onSearchChange(searchValue) {
    this.setState({ searchValue });
    this.props.onSearchChange(searchValue, { searchOrder: this.state.searchOrder });
  }

  onOrderChange(searchOrder) {
    this.setState({ searchOrder });
    this.props.onSearchChange(this.state.searchValue, { searchOrder });
  }

  render() {
    return (
      <section id="search-bar">
        <input
          onChange={event => this.onSearchChange(event.target.value)}
          placeholder={SearchBar.defaults.instruction}
          title={SearchBar.defaults.instruction}
          value={this.state.searchValue}
        />
        <select
          defaultValue="relevance"
          onChange={event => this.onOrderChange(event.target.value)}
        >
          <option value="date">Date of creation</option>
          <option value="relevance">Relevance</option>
        </select>
      </section>
    );
  }
}

SearchBar.propTypes = {
  onSearchChange: propTypes.func.isRequired
};

module.exports = SearchBar;
