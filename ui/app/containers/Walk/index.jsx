import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { useInjectReducer, useInjectSaga } from 'redux-injectors';

import { getHostToken } from '../../utils/host';

import actions from './actions';
import { resizeDimensions } from '../../../../config.json';
import reducer from './reducer';
import saga from './saga';
import { selectFiles, selectPath } from './selectors';
import walkUtils from './util';

import A from '../../components/A';
import GenericList from '../../components/GenericList';
import ListFile from './ListFile';
import LoadingIndicator from '../../components/LoadingIndicator';
import Menu from './Menu';
import OrganizePreviews from '../../components/OrganizePreviews';

const {
  addParentDirectoryNav,
  isImage,
  parseHash,
  organizeByMedia,
} = walkUtils;

const CDN_HOST = getHostToken('cdn');

function Walk({ location: { hash } }) {
  const dispatch = useDispatch();
  useInjectReducer({ key: 'walk', reducer });
  useInjectSaga({ key: 'walk', saga });

  const files = useSelector(selectFiles);
  const statePath = useSelector(selectPath);

  const [stateImages, setItems] = useState([]);
  const qsPath = parseHash('path', hash);

  useEffect(() => {
    dispatch(actions.listDirectory(qsPath));
  }, [qsPath]);

  const loading = statePath !== qsPath;

  const itemFiles = files.map(file => ({
    id: file.path,
    content: file.filename,
    ...file,
  }));
  addParentDirectoryNav(itemFiles, statePath);

  const itemImages = itemFiles.filter(file => isImage(file));
  const hasImages = !loading && stateImages.length > 0;

  useEffect(() => {
    setItems(itemImages);
  }, [files]);

  if (loading) {
    return <LoadingIndicator />;
  }

  return [
    <Helmet key="walk-Helmet">
      <title>Walk</title>
      <meta name="description" content="Description of Walk" />
    </Helmet>,
    <Menu
      key="walk-Menu"
      showMenu={hasImages}
      imageFilenames={stateImages.map(i => i.filename)}
      path={statePath}
    />,
    <GenericList
      key="walk-GenericList"
      component={ListFile}
      items={organizeByMedia(itemFiles)}
      loading={loading}
      error={false}
    />,
    <OrganizePreviews
      key="walk-OrganizePreviews"
      setItems={setItems}
      items={stateImages.map(item => ({
        ...item,
        content: [
          <span key={`label-${item.filename}`}>
            <A
              href={`${CDN_HOST}/${statePath}/${item.filename}`}
              target="_blank"
              title="View original in new tab"
            >
              {item.filename}
            </A>
          </span>,
          <img
            key={`thumbnail-${item.filename}`}
            alt="No preview yet"
            src={`${CDN_HOST}/${statePath}/${item.filename}`}
            width={resizeDimensions.preview.width}
            height={resizeDimensions.preview.height}
          />,
        ],
      }))}
    />,
  ];
}

export default Walk;
