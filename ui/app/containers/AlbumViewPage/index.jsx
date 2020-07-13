import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { useInjectReducer, useInjectSaga } from 'redux-injectors';

import InfiniteThumbs from '../InfiniteThumbs';
import LoadingIndicator from '../../components/LoadingIndicator';
import PhotoHeader from '../../components/PhotoHeader';
import SplitScreen from './SplitScreen';

import { chooseAdjacentMemory, cleanCurrentMemory, loadAlbum } from './actions';
import pageReducer from './reducer';
import {
  selectAlbumLoading,
  selectAlbumError,
  selectAlbumName,
  selectCurrentMemory,
  selectMemories,
} from './selectors';
import saga from './saga';
import albumReducer from '../App/reducer';

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

  const albumLoading = useSelector(selectAlbumLoading);
  const { albumError, albumErrorMsg } = useSelector(selectAlbumError);
  const albumName = useSelector(selectAlbumName);
  const currentMemory = useSelector(selectCurrentMemory);
  const memories = useSelector(selectMemories);

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
    <section>
      <Helmet>
        <title>{`${albumName}  Album`}</title>
      </Helmet>
      <SplitScreen currentMemory={currentMemory} memories={memories} />
      <PhotoHeader currentMemory={currentMemory} />
      <InfiniteThumbs
        error={albumErrorMsg || albumError}
        items={memories}
        loading={albumLoading}
      />
    </section>
  );
}

export default AlbumViewPage;
