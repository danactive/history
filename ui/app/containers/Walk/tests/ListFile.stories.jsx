import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import ListFile from '../ListFile';
import GenericList from '../../../components/GenericList';

import walkUtil from '../util';

const {
  addParentDirectoryNav,
  generateImageFilenames,
  organizeByMedia,
} = walkUtil;

export default {
  title: 'ListFile',
  component: ListFile,
};

export const Default = () => <ListFile />;

export const Item = () => <ListFile item={generateImageFilenames(1)[0]} />;

export const Images = () => (
  <GenericList
    key="walk-GenericList"
    component={ListFile}
    items={organizeByMedia(generateImageFilenames(8, 'jpgraw'))}
    loading={false}
    error={false}
  />
);

export const ImagesWithNav = () => {
  const itemFiles = generateImageFilenames(8, 'jpgraw');
  addParentDirectoryNav(itemFiles, 'fake');
  return (
    <BrowserRouter>
      <GenericList
        key="walk-GenericList"
        component={ListFile}
        items={organizeByMedia(itemFiles)}
        loading={false}
        error={false}
      />
    </BrowserRouter>
  );
};
