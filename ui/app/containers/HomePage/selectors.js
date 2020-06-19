import { createSelector } from 'reselect';
import { initialState } from './reducer';

const selectHome = state => state.homePage || initialState;

const makeSelectItems = () =>
  createSelector(selectHome, homeState =>
    Object.keys(homeState.galleries)
      .reduce((list, host) => {
        list.push(
          homeState.galleries[host].map(gallery => ({ ...gallery, host })),
        );
        return list;
      }, [])
      .flat(),
  );

const makeSelectGalleryLoading = () =>
  createSelector(selectHome, homeState =>
    homeState.galleryLoadings.includes(true),
  );

const makeSelectGalleryErrors = () =>
  createSelector(selectHome, homeState => {
    if (homeState.galleryErrors.includes(false) === true) {
      return false;
    }

    return { message: 'All galleries failed to load' };
  });

export {
  selectHome,
  makeSelectItems,
  makeSelectGalleryLoading,
  makeSelectGalleryErrors,
};
