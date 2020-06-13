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
import walkUtils from './util';

import GenericList from '../../components/GenericList';
import ListFolders from './ListFolders';
import OrganizePreviews from '../../components/OrganizePreviews';

const { isImage } = walkUtils;

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

  const loading = !files || files.length === 0;

  const Components = [
    <Helmet key="walk-Helmet">
      <title>Walk</title>
      <meta name="description" content="Description of Walk" />
    </Helmet>,
    <GenericList
      key="walk-GenericList"
      component={ListFolders}
      items={files.map((f) => ({ id: f.path, ...f }))}
      loading={loading}
      error={false}
    />,
  ];

  const images = files.filter((f) => isImage(f));
  if (!loading && images.length > 0) {
    Components.push(<OrganizePreviews
      key="walk-OrganizePreviews"
      items={images.map((f) => ({ id: f.path, content: f.filename, ...f }))}
    />);
  }

  return Components;
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
