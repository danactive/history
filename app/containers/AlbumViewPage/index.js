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

import GenericList from 'components/GenericList';
import ThumbListItem from 'containers/ThumbListItem';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { loadAlbum } from './actions';
import {
  makeSelectThumbs,
  makeSelectAlbumLoading,
  makeSelectAlbumError,
  makeSelectThumbsLoading,
  makeSelectThumbsError,
} from './selectors';
import reducer from './reducer';
import saga from './saga';
import messages from './messages';

export class AlbumViewPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentWillMount() {
    const { onLoad, match: { params }, location: { search: query } } = this.props;
    if (params.album) onLoad(query, params.album);
  }

  render() {
    const {
      thumbs,
      albumLoading,
      albumError,
      thumbsLoading,
      thumbsError,
    } = this.props;

    const thumbsListProps = {
      loading: albumLoading || thumbsLoading,
      error: albumError || thumbsError,
      items: thumbs,
      component: ThumbListItem,
    };

    return (
      <div>
        <Helmet>
          <title>AlbumViewPage</title>
          <meta name="description" content="Description of AlbumViewPage" />
        </Helmet>
        <FormattedMessage {...messages.header} />
        <GenericList {...thumbsListProps} />
      </div>
    );
  }
}

AlbumViewPage.propTypes = {
  thumbs: PropTypes.arrayOf(PropTypes.shape).isRequired,
  albumLoading: PropTypes.bool,
  thumbsLoading: PropTypes.bool,
  albumError: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
  ]),
  thumbsError: PropTypes.oneOfType([
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
  thumbsLoading: makeSelectThumbsLoading(),
  albumError: makeSelectAlbumError(),
  thumbsError: makeSelectThumbsError(),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoad: (querystring, album) => dispatch(loadAlbum(querystring, album)),
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'albumViewPage', reducer });
const withSaga = injectSaga({ key: 'albumViewPage', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(AlbumViewPage);
