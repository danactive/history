import { createSelector } from 'reselect';

// Memorized selectors
const selectPage = state => state.get('galleryViewPage');

const makeSelectGallery = () => createSelector(
  selectPage,
  routeState => routeState.get('gallery') || '',
);

export {
  makeSelectGallery,
};
