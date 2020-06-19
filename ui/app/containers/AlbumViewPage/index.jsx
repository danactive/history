import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { useInjectReducer, useInjectSaga } from 'redux-injectors';
import { createStructuredSelector } from 'reselect';

import InfiniteThumbs from '../InfiniteThumbs';
import PhotoHeader from '../../components/PhotoHeader';
import SplitScreen from './SplitScreen';

import { chooseAdjacentMemory, cleanCurrentMemory, loadAlbum } from './actions';
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

const stateSelector = createStructuredSelector({
  albumError: makeSelectAlbumError(),
  albumLoading: makeSelectAlbumLoading(),
  albumName: makeSelectAlbumName(),
  currentMemory: makeSelectCurrentMemory(),
  memories: makeSelectMemories(),
});

function AlbumViewPage({
  match: {
    params: { host, gallery, album },
  },
}) {
  const dispatch = useDispatch();
  useInjectReducer({ key: 'albumViewPage', reducer: pageReducer });
  useInjectReducer({ key: 'global', reducer: albumReducer });
  useInjectSaga({ key: 'albumViewPage', saga });

  const onLoad = () => dispatch(loadAlbum({ host, gallery, album }));
  const adjacentMemory = adjacentInt =>
    dispatch(chooseAdjacentMemory(adjacentInt));
  const onUnload = () => dispatch(cleanCurrentMemory());

  const {
    albumError,
    albumLoading,
    albumName,
    currentMemory,
    memories,
  } = useSelector(stateSelector);

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
    if (album) onLoad();
    document.addEventListener('keyup', handleKey); // must reference function to be removable

    return () => {
      // cleanup
      document.removeEventListener('keyup', handleKey);
      onUnload();
    };
  }, []);

  if (albumLoading) {
    return <LoadingIndicator key="loading-indicator-InfiniteScroll-loader" />;
  }

  return (
    <main>
      <Helmet>
        <title>{`${albumName}  Album`}</title>
      </Helmet>

      <PhotoHeader currentMemory={currentMemory} />

      <SplitScreen currentMemory={currentMemory} memories={memories} />

      <InfiniteThumbs
        error={albumError}
        items={memories}
        loading={albumLoading}
      />
    </main>
  );
}

export default AlbumViewPage;
