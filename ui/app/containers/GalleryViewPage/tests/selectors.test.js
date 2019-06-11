/* global describe, expect, test */

import {
  selectPage,
  makeSelectAlbums,
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

describe('makeSelectAlbums', () => {
  const albumsSelector = makeSelectAlbums();
  test('should select the album', () => {
    const albums = ['sample'];
    const mockedState = {
      galleryViewPage: {
        albums,
      },
    };
    expect(albumsSelector(mockedState)).toEqual(albums);
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
