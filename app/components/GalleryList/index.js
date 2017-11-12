/**
*
* GenericList
*
*/

import React from 'react';
import PropTypes from 'prop-types';

import List from 'components/List';
import ListItem from 'components/ListItem';
import LoadingIndicator from 'components/LoadingIndicator';

function GenericList({ loading, error, items, component }) {
  if (loading) {
    return <List component={LoadingIndicator} />;
  }

  if (error !== false) {
    const ErrorComponent = () => (
      <ListItem item={'Something went wrong, please try again!'} />
    );
    return <List component={ErrorComponent} />;
  }

  if (items.length > 0) {
    return <List items={items} component={component} />;
  }

  return null;
}

GenericList.propTypes = {
  component: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.any,
  items: PropTypes.any,
};

export default GenericList;
