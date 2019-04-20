import React from 'react';
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
import { makeSelectAlbums, makeSelectGalleryLoading, makeSelectGalleryError } from './selectors';
import reducer from './reducer';
import saga from './saga';
import messages from './messages';


export class GalleryViewPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentWillMount() {
    const { onLoad, match: { params } } = this.props;
    if (params.gallery) onLoad(params.gallery);
  }

  render() {
    const { albums, galleryLoading, galleryError } = this.props;

    const albumListProps = {
      loading: galleryLoading,
      error: galleryError,
      items: albums,
      component: AlbumListItem,
    };

    return (
      <div>
        <Helmet>
          <title>GalleryViewPage</title>
          <meta name="description" content="Description of GalleryViewPage" />
        </Helmet>
        <FormattedMessage {...messages.header} />
        <GenericList {...albumListProps} />
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  albums: makeSelectAlbums(),
  galleryLoading: makeSelectGalleryLoading(),
  galleryError: makeSelectGalleryError(),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoad: gallery => dispatch(loadGallery(gallery)),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'galleryViewPage', reducer });
const withSaga = injectSaga({ key: 'galleryViewPage', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(GalleryViewPage);
