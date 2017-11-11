/**
 * Homepage selectors
 */

import { createSelector } from 'reselect';

const selectHome = (state) => state.get('home');

const makeSelectUsername = () => createSelector(
  selectHome,
  (homeState) => homeState.get('username')
);

const makeSelectGalleries = () => createSelector(
  selectHome,
  (homeState) => {
    const contents = homeState.get('contents') || [];
    return contents.map((content) => content.path_lower);
  }
);

export {
  selectHome,
  makeSelectUsername,
  makeSelectGalleries,
};
