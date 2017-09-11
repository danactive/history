/* global _, document, fetch */

const React = require('react');
const ReactDOM = require('react-dom');
const SearchBar = require('./searchBar.jsx');
const VideoList = require('./videoList.jsx');
const VideoDetail = require('./videoDetail.jsx');

const API_KEY = 'AIzaSyC8rNZ8fkVAjK_B4UfmNQNISPar6D-TjI4';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videos: [],
      selectedVideo: null
    };
  }

  videoSearch(searchValue) {
    if (!searchValue) {
      return;
    }

    const geoAddress = `https://content.googleapis.com/youtube/v3/search?location=${searchValue}&locationRadius=1km&maxResults=5&
    order=date&part=id,snippet&type=video&videoEmbeddable=true&key=${API_KEY}&videoLiscense=any`;
    const keywordAddress = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${API_KEY}&q=${searchValue}&type=video`;
    const address = (Number(searchValue.split(',')[0])) ? geoAddress : keywordAddress;

    // most views
    // https://www.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&publishedAfter=
    // 2014-10-29T00%3A00%3A00Z&publishedBefore=2014-10-31T00%3A00%3A00Z&key=AIzaSyC8rNZ8fkVAjK_B4UfmNQNISPar6D-TjI4

    fetch(address)
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
    const videoSearch = _.debounce(searchValue => this.videoSearch(searchValue), 400);

    return (
      <section id="video-component">
        <SearchBar onSearchChange={videoSearch} />
        <VideoDetail video={this.state.selectedVideo} />
        <VideoList onVideoSelect={selectedVideo => this.setState({ selectedVideo })} videos={this.state.videos} />
      </section>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('video-container'));