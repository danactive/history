import { createSelector } from 'reselect';

// Memorized selectors
export const selectPage = (state) => state.get('albumViewPage');

export const makeSelectThumbsLoading = () => createSelector(
  selectPage,
  (pageState) => pageState.get('thumbsLoading') || false
);

export const makeSelectThumbsError = () => createSelector(
  selectPage,
  (pageState) => pageState.get('thumbsError')
);
