/* global describe, expect, test */

import {
  selectPage,
  makeSelectGalleryLoading,
  makeSelectGalleryError,
} from '../selectors';

describe('selectPage', () => {
  test('should select the page state', () => {
    const fixture = 'demo';
    const mockedState = {
      galleryViewPage: fixture,
    };
    expect(selectPage(mockedState)).toEqual(fixture);
  });
});

describe('makeSelectGalleryLoading', () => {
  const galleryLoadingSelector = makeSelectGalleryLoading();
  test('should select the loading status', () => {
    const galleryLoading = true;
    const mockedState = {
      galleryViewPage: {
        galleryLoading,
      },
    };
    expect(galleryLoadingSelector(mockedState)).toEqual(galleryLoading);
  });
});

describe('makeSelectGalleryError', () => {
  const galleryErrorSelector = makeSelectGalleryError();
  test('should select the error status', () => {
    const galleryError = true;
    const mockedState = {
      galleryViewPage: {
        galleryError,
      },
    };
    expect(galleryErrorSelector(mockedState)).toEqual(galleryError);
  });
});
