import { createSelector } from 'reselect';
import { initialState } from './reducer';

const selectWalkDomain = (state) => state.walk || initialState;

const makeSelectFiles = () => createSelector(
  selectWalkDomain,
  (pageState) => pageState.listing.files,
);

const makeSelectPath = () => createSelector(
  selectWalkDomain,
  (pageState) => pageState.listing.path,
);

export default selectWalkDomain;
export {
  makeSelectPath,
  makeSelectFiles,
};
