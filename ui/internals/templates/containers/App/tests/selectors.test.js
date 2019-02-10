/* global describe, expect, test */
import { fromJS } from 'immutable';

import makeSelectLocation from '../selectors';

describe('makeSelectLocation', () => {
  const locationStateSelector = makeSelectLocation();
  test('should select the location', () => {
    const mockedState = fromJS({
      router: { location: { pathname: '/foo' } },
    });
    expect(locationStateSelector(mockedState)).toEqual(
      mockedState.getIn(['router', 'location']).toJS(),
    );
  });
});
