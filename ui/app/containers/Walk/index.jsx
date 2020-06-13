import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';

import actions from './actions';
import reducer from './reducer';
import saga from './saga';
import { makeSelectFiles, makeSelectPath } from './selectors';
import { useInjectSaga } from '../../utils/injectSaga';
import { useInjectReducer } from '../../utils/injectReducer';

import Contents from './Contents';
import GenericList from '../../components/GenericList';

function parseQueryString(find, from) {
  if (!find || !from) return '';
  return RegExp(`[?&]${find}(=([^&#]*)|&|#|$)`).exec(from)[2];
}

function Walk({
  doListDirectory,
  files,
  location: { search: querystring },
  statePath,
}) {
  useInjectReducer({ key: 'walk', reducer });
  useInjectSaga({ key: 'walk', saga });

  const qsPath = parseQueryString('path', querystring);
  const path = qsPath || statePath;

  useEffect(() => {
    doListDirectory(path);
  }, [doListDirectory, path]);

  return [
    <Helmet key="walk-Helmet">
      <title>Walk</title>
      <meta name="description" content="Description of Walk" />
    </Helmet>,
    <GenericList
      key="walk-GenericList"
      component={Contents}
      items={files.map((f) => ({ id: f.path, ...f }))}
      loading={!files || files.length === 0}
      error={false}
    />,
  ];
}

const mapStateToProps = createStructuredSelector({
  files: makeSelectFiles(),
  statePath: makeSelectPath(),
});

const mapDispatchToProps = (dispatch) => ({
  doListDirectory: (path) => dispatch(actions.listDirectory(path)),
});

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(
  withConnect,
)(Walk);
