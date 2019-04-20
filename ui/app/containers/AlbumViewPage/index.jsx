/* global document */
import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import InfiniteThumbs from '../InfiniteThumbs';
import PhotoHeader from '../../components/PhotoHeader';
import SplitScreen from './SplitScreen';

import injectReducer from '../../utils/injectReducer';
import injectSaga from '../../utils/injectSaga';

import {
  chooseAdjacentMemory,
  loadAlbum,
} from './actions';
import albumReducer from '../App/reducer';
import pageReducer from './reducer';
import {
  makeSelectAlbumLoading,
  makeSelectAlbumError,
  makeSelectAlbumName,
  makeSelectCurrentMemory,
  makeSelectMemories,
} from './selectors';
import saga from './saga';

class AlbumViewPage extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleKey = this.handleKey.bind(this);
  }

  componentWillMount() {
    const { onLoad, match: { params }, location: { search: querystring } } = this.props;
    if (params.album) onLoad(querystring, params.album);
  }

  componentDidMount() {
    document.addEventListener('keyup', this.handleKey); // must reference function to be removable
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKey);
  }

  handleKey(event) {
    const { adjacentMemory } = this.props;
    const { key } = event;

    event.preventDefault();

    if (key === 'ArrowLeft') {
      adjacentMemory(-1);
      return;
    }
    if (key === 'ArrowRight') adjacentMemory(1);
  }

  render() {
    const {
      albumError,
      albumLoading,
      albumName,
      currentMemory,
      memories,
    } = this.props;

    return (
      <main>
        <Helmet>
          <title>{`${albumName}  Album`}</title>
        </Helmet>

        <PhotoHeader
          currentMemory={currentMemory}
        />

        <SplitScreen
          currentMemory={currentMemory}
          items={memories}
        />

        <InfiniteThumbs
          error={albumError}
          items={memories}
          loading={albumLoading}
        />
      </main>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  albumError: makeSelectAlbumError(),
  albumLoading: makeSelectAlbumLoading(),
  albumName: makeSelectAlbumName(),
  currentMemory: makeSelectCurrentMemory(),
  memories: makeSelectMemories(),
});

const mapDispatchToProps = dispatch => ({
  onLoad: (querystring, album) => dispatch(loadAlbum(querystring, album)),
  adjacentMemory: adjacentInt => dispatch(chooseAdjacentMemory(adjacentInt)),
});

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
