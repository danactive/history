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
import { makeSelectFirstAlbumName, makeSelectGalleryLoading, makeSelectGalleryError } from './selectors';
import reducer from './reducer';
import saga from './saga';
import messages from './messages';

export class GalleryViewPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentWillMount() {
    const { onLoad, match: { params } } = this.props;
    if (params.galleryName) onLoad(params.galleryName);
  }

  render() {
    return (
      <div>
        <Helmet>
          <title>GalleryViewPage</title>
          <meta name="description" content="Description of GalleryViewPage" />
        </Helmet>
        <FormattedMessage {...messages.header} />
        <div>{this.props.firstAlbumName}</div>
      </div>
    );
  }
}

GalleryViewPage.propTypes = {
  firstAlbumName: PropTypes.string.isRequired,
  onLoad: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  firstAlbumName: makeSelectFirstAlbumName(),
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
