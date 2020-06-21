import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useInjectReducer, useInjectSaga } from 'redux-injectors';
import { createStructuredSelector } from 'reselect';

import AlbumListItem from '../AlbumListItem/index';
import GenericList from '../../components/GenericList';

import { loadGallery } from './actions';
import {
  makeSelectGalleryLoading,
  makeSelectGalleryError,
  makeSelectItems,
} from './selectors';
import reducer from './reducer';
import globalReducer from '../App/reducer';
import saga from './saga';
import messages from './messages';

const stateSelector = createStructuredSelector({
  galleryLoading: makeSelectGalleryLoading(),
  galleryError: makeSelectGalleryError(),
  items: makeSelectItems(),
});

export function GalleryViewPage({
  match: {
    params: { gallery, host },
  },
}) {
  const dispatch = useDispatch();
  useInjectReducer({ key: 'galleryViewPage', reducer });
  useInjectReducer({ key: 'global', reducer: globalReducer });
  useInjectSaga({ key: 'galleryViewPage', saga });

  const { galleryLoading, galleryError, items } = useSelector(stateSelector);

  const onLoad = () => dispatch(loadGallery({ host, gallery }));

  useEffect(() => {
    if (gallery) onLoad();
  }, []);

  const albumListProps = {
    loading: galleryLoading,
    error: galleryError,
    items,
    component: AlbumListItem,
  };

  return (
    <div>
      <Helmet>
        <title>Galleries</title>
      </Helmet>
      <FormattedMessage {...messages.header} />
      <GenericList {...albumListProps} />
    </div>
  );
}

export default GalleryViewPage;
