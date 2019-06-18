/* global describe, expect, test */

import {
  selectGlobal,
  selectPage,
  makeSelectAlbums,
  makeSelectGalleryLoading,
  makeSelectGalleryError,
} from '../selectors';

describe('selectGlobal', () => {
  test('should select the page state', () => {
    const fixture = {
      gallery: 'demo',
    };
    const mockedState = {
      global: fixture,
    };
    expect(selectGlobal(mockedState)).toEqual(fixture);
  });
});

describe('selectPage', () => {
  test('should select the page state', () => {
    const fixture = {
      galleryLoading: true,
    };
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
      global: {
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
