/* global document */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import InfiniteThumbs from '../InfiniteThumbs/Loadable';
import PhotoHeader from '../../components/PhotoHeader/Loadable';
import SplitScreen from './SplitScreen';

import injectSaga from '../../utils/injectSaga';
import injectReducer from '../../utils/injectReducer';
import {
  chooseAdjacentMemory,
  loadAlbum,
} from './actions';
import {
  makeSelectAlbumLoading,
  makeSelectAlbumError,
  makeSelectAlbumName,
  makeSelectCurrentMemory,
  makeSelectMemories,
} from './selectors';
import pageReducer from './reducer';
import albumReducer from '../InfiniteThumbs/reducer';
import saga from './saga';

export class AlbumViewPage extends React.PureComponent {
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
      albumLoading,
      albumError,
      albumName,
      currentMemory,
      memories,
    } = this.props;

    return (
      <div>
        <Helmet>
          <title>{`${albumName}  Album`}</title>
        </Helmet>
        <PhotoHeader currentMemory={currentMemory} />
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
  adjacentMemory: PropTypes.func.isRequired,
  albumLoading: PropTypes.bool,
  albumName: PropTypes.string,
  albumError: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
  ]),
  currentMemory: PropTypes.object,
  match: PropTypes.shape({ // router
    params: PropTypes.shape({
      album: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  memories: PropTypes.arrayOf(PropTypes.shape).isRequired,
  location: PropTypes.shape({ // router
    search: PropTypes.string.isRequired,
  }).isRequired,
  onLoad: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  albumLoading: makeSelectAlbumLoading(),
  albumError: makeSelectAlbumError(),
  albumName: makeSelectAlbumName(),
  currentMemory: makeSelectCurrentMemory(),
  memories: makeSelectMemories(),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoad: (querystring, album) => dispatch(loadAlbum(querystring, album)),
    adjacentMemory: adjacentInt => dispatch(chooseAdjacentMemory(adjacentInt)),
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
