import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import { useInjectSaga } from '../../utils/injectSaga';
import { useInjectReducer } from '../../utils/injectReducer';
import actions from './actions';
import {
  makeSelectFiles,
  makeSelectPath,
} from './selectors';
import reducer from './reducer';
import saga from './saga';

import Contents from './contents';

import walkUtils from './util';

const { areImages } = walkUtils;

function parseQueryString(find, from) {
  if (!find || !from) return '';
  return RegExp(`[?&]${find}(=([^&#]*)|&|#|$)`).exec(from)[2];
}

function Walk({
  getFilesByPath,
  files,
  location: { search: querystring },
  path: pathProp,
}) {
  useInjectReducer({ key: 'walk', reducer });
  useInjectSaga({ key: 'walk', saga });

  const qsPath = parseQueryString('path', querystring);
  const path = qsPath || pathProp;

  useEffect(() => {
    getFilesByPath(path);
  }, []);

  const hasImage = files.some(areImages);

  return (
    <div>
      <Helmet>
        <title>Walk</title>
        <meta name="description" content="Description of Walk" />
      </Helmet>
      <Contents files={files} showControls={hasImage} />
    </div>
  );
}

const mapStateToProps = createStructuredSelector({
  files: makeSelectFiles(),
  path: makeSelectPath(),
});

const mapDispatchToProps = dispatch => ({
  getFilesByPath: path => dispatch(actions.getFilesByPath(path)),
});

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(
  withConnect,
)(Walk);
