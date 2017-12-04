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

import InfiniteScroll from 'react-infinite-scroller';
import ThumbImg from 'components/ThumbImg';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { loadAlbum, loadNextPage } from './actions';
import {
  makeSelectThumbs,
  makeSelectAlbumLoading,
  makeSelectAlbumError,
  makeSelectThumbsLoading,
  makeSelectThumbsError,
  makeSelectMoreThumbs,
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
      thumbs,
      // albumLoading,
      // albumError,
      // thumbsLoading,
      // thumbsError,
      nextPage,
      hasMore,
    } = this.props;

    // const thumbsListProps = {
    //   loading: albumLoading || thumbsLoading,
    //   error: albumError || thumbsError,
    //   items: thumbs,
    //   component: ThumbListItem,
    // };
    //
    const html = thumbs.map((item) => (
      <ThumbImg src={item.link} alt={item.filename} key={`thumb-${item.filename}`} />
    ));

    return (
      <div>
        <Helmet>
          <title>AlbumViewPage</title>
          <meta name="description" content="Description of AlbumViewPage" />
        </Helmet>
        <FormattedMessage {...messages.header} />

        <InfiniteScroll
          pageStart={0}
          loadMore={nextPage}
          hasMore={hasMore}
          loader={<div className="loader">Loading ...</div>}
          threshold={500}
        >
          {html}
        </InfiniteScroll>
      </div>
    );
  }
}

AlbumViewPage.propTypes = {
  hasMore: PropTypes.bool,
  thumbs: PropTypes.arrayOf(PropTypes.shape).isRequired,
  // albumLoading: PropTypes.bool,
  // thumbsLoading: PropTypes.bool,
  // albumError: PropTypes.oneOfType([
  //   PropTypes.object,
  //   PropTypes.bool,
  // ]),
  // thumbsError: PropTypes.oneOfType([
  //   PropTypes.object,
  //   PropTypes.bool,
  // ]),
  nextPage: PropTypes.func.isRequired,
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
  hasMore: makeSelectMoreThumbs(),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoad: (querystring, album) => dispatch(loadAlbum(querystring, album)),
    nextPage: () => dispatch(loadNextPage()),
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
