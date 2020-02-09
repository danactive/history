import { createSelector } from 'reselect';
import { initialState } from './reducer';

const selectWalkDomain = state => state.walk || initialState;

const makeSelectWalk = () => createSelector(
  selectWalkDomain,
  substate => substate.listing.files,
);

export default makeSelectWalk;
export { selectWalkDomain };
