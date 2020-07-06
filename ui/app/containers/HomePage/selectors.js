import { createSelector } from '@reduxjs/toolkit';

import { initialState } from './reducer';

const selectHome = state => state.homePage || initialState;

const selectItems = createSelector(selectHome, homeState =>
  Object.keys(homeState.galleries)
    .reduce((list, host) => {
      list.push(
        homeState.galleries[host].map(gallery => ({ ...gallery, host })),
      );
      return list;
    }, [])
    .flat(),
);

const selectGalleryLoading = createSelector(selectHome, homeState =>
  homeState.galleryLoadings.includes(true),
);

const selectGalleryErrors = createSelector(selectHome, homeState => {
  if (homeState.galleryErrors.includes(false) === true) {
    return false;
  }

  return { message: 'All galleries failed to load' };
});

const selectMissingHosts = createSelector(selectHome, homeState => {
  const missing = [];
  if (homeState.galleries.local.length === 0) {
    missing.push('local');
  }

  if (homeState.galleries.dropbox.length === 0) {
    missing.push('dropbox');
  }

  return missing;
});

export {
  selectHome,
  selectItems,
  selectGalleryLoading,
  selectGalleryErrors,
  selectMissingHosts,
};
