import { createSelector } from 'reselect';

// Memorized selectors
const selectPage = state => state.galleryViewPage;

const makeSelectGallery = () => createSelector(
  selectPage,
  routeState => routeState.gallery || '',
);

export {
  selectPage,
  makeSelectGallery,
};
