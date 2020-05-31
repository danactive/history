/* global document */
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import InfiniteThumbs from '../InfiniteThumbs';
import PhotoHeader from '../../components/PhotoHeader';
import SplitScreen from './SplitScreen';

import injectReducer from '../../utils/injectReducer';
import injectSaga from '../../utils/injectSaga';

import {
  chooseAdjacentMemory,
  cleanCurrentMemory,
  loadAlbum,
} from './actions';
import albumReducer from '../App/reducer';
import pageReducer from './reducer';
import {
  makeSelectAlbumLoading,
  makeSelectAlbumError,
  makeSelectAlbumName,
  makeSelectCurrentMemory,
  makeSelectMemories,
} from './selectors';
import saga from './saga';
import LoadingIndicator from '../../components/LoadingIndicator';

function AlbumViewPage({
  onLoad,
  onUnload,
  match: {
    params: {
      host,
      gallery,
      album,
    },
  },
  albumError,
  albumLoading,
  albumName,
  adjacentMemory,
  currentMemory,
  memories,
}) {
  function handleKey(event) {
    const { key } = event;

    event.preventDefault();

    if (key === 'ArrowLeft') {
      adjacentMemory(-1);
      return;
    }
    if (key === 'ArrowRight') adjacentMemory(1);
  }

  useEffect(() => {
    if (album) onLoad({ host, gallery, album });
    document.addEventListener('keyup', handleKey); // must reference function to be removable

    return () => { // cleanup
      document.removeEventListener('keyup', handleKey);
      onUnload();
    };
  }, []);

  if (albumLoading) {
    return (
      <LoadingIndicator key="loading-indicator-InfiniteScroll-loader" />
    );
  }

  return (
    <main>
      <Helmet>
        <title>{`${albumName}  Album`}</title>
      </Helmet>

      <PhotoHeader
        currentMemory={currentMemory}
      />

      <SplitScreen
        currentMemory={currentMemory}
        items={memories}
      />

      <InfiniteThumbs
        error={albumError}
        items={memories}
        loading={albumLoading}
      />
    </main>
  );
}

const mapStateToProps = createStructuredSelector({
  albumError: makeSelectAlbumError(),
  albumLoading: makeSelectAlbumLoading(),
  albumName: makeSelectAlbumName(),
  currentMemory: makeSelectCurrentMemory(),
  memories: makeSelectMemories(),
});

const mapDispatchToProps = dispatch => ({
  onLoad: ({ host, gallery, album }) => dispatch(loadAlbum({ host, gallery, album })),
  adjacentMemory: adjacentInt => dispatch(chooseAdjacentMemory(adjacentInt)),
  onUnload: () => dispatch(cleanCurrentMemory()),
});

const withConnect = connect(mapStateToProps, mapDispatchToProps);
const withPageReducer = injectReducer({ key: 'albumViewPage', reducer: pageReducer });
const withAlbumReducer = injectReducer({ key: 'global', reducer: albumReducer });
const withSaga = injectSaga({ key: 'albumViewPage', saga });

export default compose(
  withPageReducer,
  withAlbumReducer,
  withSaga,
  withConnect,
)(AlbumViewPage);
