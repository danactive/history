/**
*
* GalleryList
*
*/

import React from 'react';
import PropTypes from 'prop-types';

import List from 'components/List';
import ListItem from 'components/ListItem';
import LoadingIndicator from 'components/LoadingIndicator';
import GalleryListItem from 'containers/GalleryListItem';

function GalleryList({ loading, error, galleries }) {
  if (loading) {
    return <List component={LoadingIndicator} />;
  }

  if (error !== false) {
    const ErrorComponent = () => (
      <ListItem item={'Something went wrong, please try again!'} />
    );
    return <List component={ErrorComponent} />;
  }

  if (galleries.length > 0) {
    return <List items={galleries} component={GalleryListItem} />;
  }

  return null;
}

GalleryList.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.any,
  galleries: PropTypes.any,
};

export default GalleryList;
