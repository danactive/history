/* global fetch */
import React, { useState } from 'react';
import _ from 'lodash';

import SearchBar from './SearchBar';
import VideoList from './VideoList';
import VideoDetail from './VideoDetail';

const API_KEY = process.env.HISTORY_YOUTUBE_API_KEY;

export default function ExploreVideo() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, selectVideo] = useState(null);

  const fetchVideos = (searchValue, options = {}) => {
    if (!searchValue) {
      return undefined;
    }

    const order = (options.searchOrder) ? `&order=${options.searchOrder}` : '';

    const geoAddress = `https://content.googleapis.com/youtube/v3/search?location=${searchValue}&locationRadius=1km&maxResults=5${order}`
    + `&part=id,snippet&type=video&videoEmbeddable=true&key=${API_KEY}&videoLiscense=any`;
    const keywordAddress = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${API_KEY}&q=${searchValue}&type=video${order}`;

    const address = (Number(searchValue.split(',')[0])) ? geoAddress : keywordAddress;

    // most views
    // https://www.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&publishedAfter=
    // 2014-10-29T00%3A00%3A00Z&publishedBefore=2014-10-31T00%3A00%3A00Z&key=AIzaSyC8rNZ8fkVAjK_B4UfmNQNISPar6D-TjI4

    return fetch(address)
      .then((response) => response.json())
      .then((payload) => {
        setVideos(payload.items);
        selectVideo(payload.items[0]);
      })
      .catch((error) => console.debug(error.message)); // eslint-disable-line no-console
  };

  const videoSearch = _.debounce((searchValue, options) => fetchVideos(searchValue, options), 400);

  return (
    <section id="video-component">
      <SearchBar onSearchChange={videoSearch} />
      <VideoDetail video={selectedVideo} />
      <VideoList onVideoSelect={selectVideo} videos={videos} />
    </section>
  );
}
