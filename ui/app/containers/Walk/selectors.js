import { createSelector } from 'reselect';
import { initialState } from './reducer';

const selectWalkDomain = (state) => state.walk || initialState;

const makeSelectFiles = () => createSelector(
  selectWalkDomain,
  (substate) => substate.listing.files,
);

const makeSelectPath = () => createSelector(
  selectWalkDomain,
  (substate) => substate.listing.path,
);

export default selectWalkDomain;
export {
  makeSelectPath,
  makeSelectFiles,
};
