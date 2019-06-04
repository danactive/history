/* global describe, expect, test */
import { makeSelectLocation } from 'containers/App/selectors';

describe('makeSelectLocation', () => {
  test('should select the location', () => {
    const router = {
      location: { pathname: '/foo' },
    };
    const mockedState = {
      router,
    };
    expect(makeSelectLocation()(mockedState)).toEqual(router.location);
  });
});
