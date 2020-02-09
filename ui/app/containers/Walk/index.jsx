import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import { useInjectSaga } from '../../utils/injectSaga';
import { useInjectReducer } from '../../utils/injectReducer';
import actions from './actions';
import makeSelectWalk from './selectors';
import reducer from './reducer';
import saga from './saga';

import Contents from './contents';

import walkUtils from './util';

const { areImages } = walkUtils;

function Walk({
  getFilesByPath,
  files,
}) {
  useInjectReducer({ key: 'walk', reducer });
  useInjectSaga({ key: 'walk', saga });

  useEffect(() => {
    console.log('effect', getFilesByPath());
  }, []);

  console.log('files', files);
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
  files: makeSelectWalk(),
});

const mapDispatchToProps = dispatch => ({
  getFilesByPath: () => dispatch(actions.getFilesByPath()),
});

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(
  withConnect,
)(Walk);
