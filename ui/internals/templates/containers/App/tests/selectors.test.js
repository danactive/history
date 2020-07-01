import { selectLocation } from '../selectors';

describe('selectLocation', () => {
  test('should select the location', () => {
    const router = {
      location: { pathname: '/foo' },
    };
    const mockedState = {
      router,
    };
    expect(selectLocation(mockedState)).toEqual(router.location);
  });
});
