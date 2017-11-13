import { createSelector } from 'reselect';

// Memorized selectors
const selectPage = (state) => state.get('galleryViewPage');

const makeSelectGalleryName = () => createSelector(
  selectPage,
  (routeState) => routeState.get('galleryName') || ''
);

export {
  makeSelectGalleryName,
};
