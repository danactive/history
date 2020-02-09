/* global beforeEach, describe, expect, test */

// import produce from 'immer';
import walkReducer from '../reducer';
// import { someAction } from '../actions';

/* eslint-disable default-case, no-param-reassign */
describe('walkReducer', () => {
  let state;
  beforeEach(() => {
    state = {
      // default state params here
    };
  });

  test('returns the initial state', () => {
    const expectedResult = state;
    expect(walkReducer(undefined, {})).toEqual(expectedResult);
  });

  /**
   * Example state change comparison
   *
   * test('should handle the someAction action correctly', () => {
   *   const expectedResult = produce(state, draft => {
   *     draft.loading = true;
   *     draft.error = false;
   *     draft.userData.nested = false;
   *   });
   *
   *   expect(appReducer(state, someAction())).toEqual(expectedResult);
   * });
   */
});
