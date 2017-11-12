/**
 *
 * GalleryViewPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { loadGallery } from './actions';
import { makeSelectAlbums, makeSelectGalleryLoading, makeSelectGalleryError } from './selectors';
import reducer from './reducer';
import saga from './saga';
import messages from './messages';

export class GalleryViewPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentWillMount() {
    const { onLoad, match: { params } } = this.props;
    if (params.galleryName) onLoad(params.galleryName);
  }

  render() {
    this.props.albums.forEach((album) => console.log(album.name));

    return (
      <div>
        <Helmet>
          <title>GalleryViewPage</title>
          <meta name="description" content="Description of GalleryViewPage" />
        </Helmet>
        <FormattedMessage {...messages.header} />
      </div>
    );
  }
}

GalleryViewPage.propTypes = {
  albums: PropTypes.arrayOf(PropTypes.shape).isRequired,
  onLoad: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  albums: makeSelectAlbums(),
  galleryLoading: makeSelectGalleryLoading(),
  galleryError: makeSelectGalleryError(),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoad: (galleryName) => dispatch(loadGallery(galleryName)),
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
