/* global describe, expect, test */
import { fromJS } from 'immutable';

import { selectHome } from '../selectors';

describe('selectHome', () => {
  test('should select the home state', () => {
    const homeState = fromJS({
      userData: {},
    });
    const mockedState = fromJS({
      home: homeState,
    });
    expect(selectHome(mockedState)).toEqual(homeState);
  });
});
