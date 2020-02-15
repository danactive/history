import { createSelector } from 'reselect';
import { initialState } from './reducer';

const selectHome = state => state.home || initialState;

const makeSelectItems = () => createSelector(
  selectHome,
  homeState => homeState.galleries.dropbox.map(gallery => ({
    name: gallery.name,
    host: 'dropbox',
    id: gallery.id,
  })),
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
  makeSelectItems,
  makeSelectGalleryLoading,
  makeSelectGalleryError,
};
