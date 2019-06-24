import { createSelector } from 'reselect';

// Memorized selectors
const selectSection = state => state.mediaGallery;

const makeSelectGallery = () => createSelector(
  selectSection,
  routeState => routeState.gallery || '',
);

export {
  selectSection,
  makeSelectGallery,
};
