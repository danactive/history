import { createSelector } from 'reselect';
import { initialState } from './reducer';

const selectHome = state => state.home || initialState;

const makeSelectGalleries = () => createSelector(
  selectHome,
  homeState => homeState.contents || [],
);

const makeSelectGalleryLoading = () => createSelector(
  selectHome,
  homeState => homeState.galleryLoading,
);

const makeSelectGalleryError = () => createSelector(
  selectHome,
  homeState => homeState.galleryError,
);

export {
  selectHome,
  makeSelectGalleries,
  makeSelectGalleryLoading,
  makeSelectGalleryError,
};

