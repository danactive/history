import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import GenericList from '../../components/GenericList';
import AlbumListItem from '../AlbumListItem/index';

import injectSaga from '../../utils/injectSaga';
import injectReducer from '../../utils/injectReducer';
import { loadGallery } from './actions';
import { makeSelectGalleryLoading, makeSelectGalleryError, makeSelectItems } from './selectors';
import reducer from './reducer';
import globalReducer from '../App/reducer';
import saga from './saga';
import messages from './messages';

export function GalleryViewPage({
  onLoad,
  match: { params: { gallery, host } },
  galleryLoading,
  galleryError,
  items,
}) {
  useEffect(() => {
    if (gallery) onLoad(host, gallery);
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

const mapStateToProps = createStructuredSelector({
  galleryLoading: makeSelectGalleryLoading(),
  galleryError: makeSelectGalleryError(),
  items: makeSelectItems(),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoad: (host, gallery) => dispatch(loadGallery(host, gallery)),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'galleryViewPage', reducer });
const withGlobalReducer = injectReducer({ key: 'global', reducer: globalReducer });
const withSaga = injectSaga({ key: 'galleryViewPage', saga });

export default compose(
  withReducer,
  withGlobalReducer,
  withSaga,
  withConnect,
)(GalleryViewPage);
