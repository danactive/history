/* global beforeEach, describe, expect, test */
import homeReducer, { initialState } from '../reducer';

describe('homeReducer', () => {
  let state;
  beforeEach(() => {
    state = initialState;
  });

  test('should return the initial state', () => {
    const expectedResult = state;
    expect(homeReducer(undefined, {})).toEqual(expectedResult);
  });
});
