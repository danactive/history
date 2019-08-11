/* global describe, expect, test */

import {
  selectAlbum,
  selectPage,
} from '../selectors';

describe('Memorized selectors', () => {
  test('should select the page state for InfiniteThumbs', () => {
    const pageState = {
      page: 0,
      hasMore: true,
    };
    const mockedState = {
      infiniteThumbs: pageState,
    };
    const received = selectPage(mockedState);
    const expected = pageState;
    expect(received).toEqual(expected);
  });
});
