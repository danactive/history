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
import SplitScreen from './SplitScreen.jsx';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { loadAlbum } from './actions';
import {
  makeSelectMemories,
  makeSelectAlbumLoading,
  makeSelectAlbumError,
  makeSelectCurrentMemory,
} from './selectors';
import pageReducer from './reducer';
import albumReducer from '../InfiniteThumbs/reducer';
import saga from './saga';
import messages from './messages';

export class AlbumViewPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentWillMount() {
    const { onLoad, match: { params }, location: { search: querystring } } = this.props;
    if (params.album) onLoad(querystring, params.album);
  }

  render() {
    const {
      albumLoading,
      albumError,
      currentMemory,
      memories,
    } = this.props;

    return (
      <div>
        <Helmet>
          <title>History - Album</title>
          <meta name="description" content="Description of AlbumViewPage" />
        </Helmet>
        <FormattedMessage {...messages.header} />
        <SplitScreen
          currentMemory={currentMemory}
          items={memories}
        />
        <InfiniteThumbs loading={albumLoading} error={albumError} items={memories} />
      </div>
    );
  }
}

AlbumViewPage.propTypes = {
  memories: PropTypes.arrayOf(PropTypes.shape).isRequired,
  currentMemory: PropTypes.object,
  albumLoading: PropTypes.bool,
  albumError: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
  ]),
  onLoad: PropTypes.func.isRequired,
  match: PropTypes.shape({ // router
    params: PropTypes.shape({
      album: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  location: PropTypes.shape({ // router
    search: PropTypes.string.isRequired,
  }).isRequired,
};

const mapStateToProps = createStructuredSelector({
  memories: makeSelectMemories(),
  albumLoading: makeSelectAlbumLoading(),
  albumError: makeSelectAlbumError(),
  currentMemory: makeSelectCurrentMemory(),
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
