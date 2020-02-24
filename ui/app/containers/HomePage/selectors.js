import { createSelector } from 'reselect';
import { initialState } from './reducer';

const selectHome = state => state.homePage || initialState;

const makeSelectItems = () => createSelector(
  selectHome,
  homeState => Object.keys(homeState.galleries)
    .reduce((list, host) => {
      list.push(homeState.galleries[host].map(gallery => ({ ...gallery, host })));
      return list;
    }, []).flat(),
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
