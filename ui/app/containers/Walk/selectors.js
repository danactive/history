import { createSelector } from '@reduxjs/toolkit';
import { initialState } from './reducer';

const selectWalkDomain = state => state.walk || initialState;

const selectFiles = createSelector(
  [selectWalkDomain],
  pageState => pageState.listing.files,
);

const selectPath = createSelector(
  [selectWalkDomain],
  pageState => pageState.listing.path,
);

export { selectPath, selectFiles };
