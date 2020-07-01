import {
  selectHome,
  selectGalleryLoading,
  selectGalleryErrors,
} from '../selectors';

import { initialState } from '../reducer';

describe('selectHome', () => {
  test('should select the home state', () => {
    expect(selectHome({})).toEqual(initialState);
  });
});

describe('selectGalleryLoading', () => {
  test('all galleries fail', () => {
    const mockedState = {
      homePage: {
        galleryLoadings: [false, false],
      },
    };
    expect(selectGalleryLoading(mockedState)).toEqual(false);
  });

  test('one gallery loaded', () => {
    const mockedState = {
      homePage: {
        galleryLoadings: [false, true],
      },
    };
    expect(selectGalleryLoading(mockedState)).toEqual(true);
  });
});

describe('selectGalleryErrors', () => {
  test('no errors found', () => {
    const mockedState = {
      homePage: {
        galleryErrors: [false, true],
      },
    };
    expect(selectGalleryErrors(mockedState)).toEqual(false);
  });

  test('error found', () => {
    const mockedState = {
      homePage: {
        galleryErrors: [true, true],
      },
    };
    expect(selectGalleryErrors(mockedState)).toHaveProperty('message');
  });
});
