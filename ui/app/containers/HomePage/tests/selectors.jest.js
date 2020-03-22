/* global describe, expect, test */

import {
  selectHome,
  makeSelectGalleryLoading,
  makeSelectGalleryErrors,
} from '../selectors';

describe('selectHome', () => {
  test('should select the home state', () => {
    const homeState = {
      contents: {},
    };
    const mockedState = {
      home: homeState,
    };
    expect(selectHome(mockedState)).toEqual(homeState);
  });
});

describe('makeSelectGalleryLoading', () => {
  const galleryLoadingsSelector = makeSelectGalleryLoading();
  test('should select the loading status', () => {
    const galleryLoadings = true;
    const mockedState = {
      home: {
        galleryLoadings,
      },
    };
    expect(galleryLoadingsSelector(mockedState)).toEqual(galleryLoadings);
  });
});

describe('makeSelectGalleryErrors', () => {
  const galleryErrorsSelector = makeSelectGalleryErrors();
  test('should select the error status', () => {
    const galleryErrors = true;
    const mockedState = {
      home: {
        galleryErrors,
      },
    };
    expect(galleryErrorsSelector(mockedState)).toEqual(galleryErrors);
  });
});
