import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';

import actions from './actions';
import config from '../../../../config.json';
import reducer from './reducer';
import saga from './saga';
import { makeSelectFiles, makeSelectPath } from './selectors';
import { useInjectSaga } from '../../utils/injectSaga';
import { useInjectReducer } from '../../utils/injectReducer';
import walkUtils from './util';

import GenericList from '../../components/GenericList';
import ListFile from './ListFile';
import Menu from './Menu';
import OrganizePreviews from '../../components/OrganizePreviews';

const {
  addParentDirectoryNav,
  isImage,
  parseQueryString,
  organizeByMedia,
} = walkUtils;

function Walk({
  location: { search: querystring },
}) {
  const dispatch = useDispatch();
  useInjectReducer({ key: 'walk', reducer });
  useInjectSaga({ key: 'walk', saga });
  const files = useSelector(makeSelectFiles());
  const statePath = useSelector(makeSelectPath());
  const [stateItems, setItems] = useState([]);
  const qsPath = parseQueryString('path', querystring);
  const path = qsPath || statePath;

  useEffect(() => {
    dispatch(actions.listDirectory(path));
  }, [path]);

  const loading = !files || files.length === 0;
  const itemFiles = files.map((file) => ({
    id: file.path,
    content: file.filename,
    ...file,
  }));
  addParentDirectoryNav(itemFiles, path);

  const itemImages = itemFiles.filter((file) => isImage(file));
  const hasImages = !loading && itemImages.length > 0;

  const Components = [
    <Helmet key="walk-Helmet">
      <title>Walk</title>
      <meta name="description" content="Description of Walk" />
    </Helmet>,
    <Menu
      key="walk-Menu"
      showMenu={hasImages}
      imageFilenames={stateItems.map((i) => i.filename)}
      path={path}
    />,
    <GenericList
      key="walk-GenericList"
      component={ListFile}
      items={organizeByMedia(itemFiles)}
      loading={loading}
      error={false}
    />,
  ];

  if (hasImages) {
    let items = itemImages;
    if (stateItems.length > 0) {
      items = stateItems;
    } else {
      setItems(itemImages);
    }

    Components.push(<OrganizePreviews
      key="walk-OrganizePreviews"
      items={items.map((item) => ({
        ...item,
        content: [
          <span key={`label-${item.filename}`}>{item.filename}</span>,
          <img
            key={`thumbnail-${item.filename}`}
            alt="No preview yet"
            src={`http://localhost:${config.apiPort}/public/${path}/${item.filename}`}
            width={config.resizeDimensions.preview.width}
            height={config.resizeDimensions.preview.height}
          />,
        ],
      }))}
      setItems={setItems}
    />);
  }

  return Components;
}

export default Walk;
