import {
  selectPage,
  selectGalleryLoading,
  selectGalleryError,
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

describe('selectGalleryLoading', () => {
  test('should select the loading status', () => {
    const galleryLoading = true;
    const mockedState = {
      galleryViewPage: {
        galleryLoading,
      },
    };
    expect(selectGalleryLoading(mockedState)).toEqual(galleryLoading);
  });
});

describe('selectGalleryError', () => {
  test('should select the error status', () => {
    const galleryError = true;
    const mockedState = {
      galleryViewPage: {
        galleryError,
      },
    };
    expect(selectGalleryError(mockedState)).toEqual(galleryError);
  });
});
