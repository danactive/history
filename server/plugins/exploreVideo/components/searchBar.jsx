/* global URL, window */
const React = require('react');

class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    const geocode = SearchBar.getGeoCode(SearchBar.getQS());
    const searchValue = geocode || SearchBar.defaults.geocode;
    const { searchOrder } = SearchBar.defaults;
    this.state = { searchValue, searchOrder };
  }

  componentDidMount() {
    const {
      onSearchChange,
    } = this.props;
    const {
      searchOrder,
      searchValue,
    } = this.state;
    onSearchChange(searchValue, { searchOrder });
  }

  onSearchChange(searchValue) {
    const {
      onSearchChange,
    } = this.props;
    const {
      searchOrder,
    } = this.state;
    this.setState({ searchValue });
    onSearchChange(searchValue, { searchOrder });
  }

  onOrderChange(searchOrder) {
    const {
      onSearchChange,
    } = this.props;
    const {
      searchValue,
    } = this.state;
    this.setState({ searchOrder });
    onSearchChange(searchValue, { searchOrder });
  }

  static get defaults() {
    return {
      geocode: '13.7524000,100.5021833',
      instruction: 'Keyword or GeoCode',
      searchOrder: 'relevance',
    };
  }

  static getQS() {
    return (typeof URL === 'undefined') ? '' : new URL(window.location.href).search;
  }

  // output sample '49.25,-123.1' or ''
  static getGeoCode(qs) {
    const matches = /(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/.exec(qs);
    return (matches) ? matches[0] : '';
  }

  render() {
    const {
      searchValue,
    } = this.state;
    return (
      <section id="search-bar">
        <input
          onChange={event => this.onSearchChange(event.target.value)}
          placeholder={SearchBar.defaults.instruction}
          title={SearchBar.defaults.instruction}
          value={searchValue}
          tabIndex="1"
        />
        <select
          defaultValue="relevance"
          onChange={event => this.onOrderChange(event.target.value)}
          tabIndex="2"
        >
          <option value="date">
            Date of creation
          </option>
          <option value="relevance">
            Relevance
          </option>
        </select>
      </section>
    );
  }
}

module.exports = SearchBar;
