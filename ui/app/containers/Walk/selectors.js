import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the walk state domain
 */

const selectWalkDomain = state => state.walk || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by Walk
 */

const makeSelectWalk = () => createSelector(selectWalkDomain, substate => substate);

export default makeSelectWalk;
export { selectWalkDomain };
