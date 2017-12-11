/**
 *
 * AlbumViewPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import InfiniteThumbs from 'containers/InfiniteThumbs/Loadable';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { loadAlbum } from './actions';
import {
  makeSelectThumbs,
  makeSelectAlbumLoading,
  makeSelectAlbumError,
} from './selectors';
import pageReducer, { albumReducer } from './reducer';
import saga from './saga';
import messages from './messages';

export class AlbumViewPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentWillMount() {
    const { onLoad, match: { params }, location: { search: query } } = this.props;
    if (params.album) onLoad(query, params.album);
  }

  render() {
    const {
      albumLoading,
      albumError,
      thumbs,
    } = this.props;

    const thumbsProps = {
      loading: albumLoading,
      error: albumError,
      items: thumbs,
    };

    return (
      <div>
        <Helmet>
          <title>AlbumViewPage</title>
          <meta name="description" content="Description of AlbumViewPage" />
        </Helmet>
        <FormattedMessage {...messages.header} />

        <InfiniteThumbs {...thumbsProps} />
      </div>
    );
  }
}

AlbumViewPage.propTypes = {
  thumbs: PropTypes.arrayOf(PropTypes.shape).isRequired,
  albumLoading: PropTypes.bool,
  albumError: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
  ]),
  onLoad: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired, // router
  location: PropTypes.object.isRequired, // router
};

const mapStateToProps = createStructuredSelector({
  thumbs: makeSelectThumbs(),
  albumLoading: makeSelectAlbumLoading(),
  albumError: makeSelectAlbumError(),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoad: (querystring, album) => dispatch(loadAlbum(querystring, album)),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);
const withPageReducer = injectReducer({ key: 'albumViewPage', reducer: pageReducer });
const withAlbumReducer = injectReducer({ key: 'albums', reducer: albumReducer });
const withSaga = injectSaga({ key: 'albumViewPage', saga });

export default compose(
  withPageReducer,
  withAlbumReducer,
  withSaga,
  withConnect,
)(AlbumViewPage);
