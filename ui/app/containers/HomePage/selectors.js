/**
 * Homepage selectors
 */

import { createSelector } from 'reselect';
import { initialState } from './reducer';

const selectHome = state => state.get('home', initialState);

const makeSelectUsername = () => createSelector(selectHome, homeState => homeState.get('username'));

const makeSelectGalleries = () => createSelector(
  selectHome,
  homeState => homeState.get('contents') || [],
);

const makeSelectGalleryLoading = () => createSelector(
  selectHome,
  homeState => homeState.get('galleryLoading'),
);

const makeSelectGalleryError = () => createSelector(
  selectHome,
  homeState => homeState.get('galleryError'),
);

export {
  selectHome,
  makeSelectUsername,
  makeSelectGalleries,
  makeSelectGalleryLoading,
  makeSelectGalleryError,
};
