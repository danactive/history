/* global describe, expect, test */
/**
 * Test route reducer
 */

import { fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'connected-react-router/immutable';
import routeReducer from '../reducers';

describe('route reducer', () => {
  test('should return the initial state', () => {
    const initialState = { foo: 'bar' };
    expect(routeReducer(initialState, {})).toEqual(initialState);
  });

  test('should handle the location_change action correctly', () => {
    const state = fromJS({ location: 'somewhere' });
    const payload = 'elsewhere';
    const action = { type: LOCATION_CHANGE, payload };

    const expectedState = { location: payload };
    const resultState = routeReducer(state, action).toJS();
    expect(resultState).toEqual(expectedState);
  });
});
