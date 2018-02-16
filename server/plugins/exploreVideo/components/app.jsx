/* global _, fetch */
const React = require('react');

const credentials = require('../../../credentials');
const SearchBar = require('./searchBar.jsx');
const VideoList = require('./videoList.jsx');
const VideoDetail = require('./videoDetail.jsx');

const API_KEY = credentials.youtube.api_key;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videos: [],
      selectedVideo: null
    };
  }

  videoSearch(searchValue, options = {}) {
    if (!searchValue) {
      return undefined;
    }

    const order = (options.searchOrder) ? `&order=${options.searchOrder}` : '';

    const geoAddress = `https://content.googleapis.com/youtube/v3/search?location=${searchValue}&locationRadius=1km&maxResults=5${order}` +
    `&part=id,snippet&type=video&videoEmbeddable=true&key=${API_KEY}&videoLiscense=any`;
    const keywordAddress = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${API_KEY}&q=${searchValue}&type=video${order}`;

    const address = (Number(searchValue.split(',')[0])) ? geoAddress : keywordAddress;

    // most views
    // https://www.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&publishedAfter=
    // 2014-10-29T00%3A00%3A00Z&publishedBefore=2014-10-31T00%3A00%3A00Z&key=AIzaSyC8rNZ8fkVAjK_B4UfmNQNISPar6D-TjI4

    return fetch(address)
      .then(response => response.json())
      .then((payload) => {
        this.setState({
          videos: payload.items,
          selectedVideo: payload.items[0]
        });
      })
      .catch(error => console.log(error.message));
  }

  render() {
    const videoSearch = _.debounce((searchValue, options) => this.videoSearch(searchValue, options), 400);

    return (
      <section id="video-component">
        <SearchBar onSearchChange={videoSearch} />
        <VideoDetail video={this.state.selectedVideo} />
        <VideoList onVideoSelect={selectedVideo => this.setState({ selectedVideo })} videos={this.state.videos} />
      </section>
    );
  }
}

module.exports = App;
