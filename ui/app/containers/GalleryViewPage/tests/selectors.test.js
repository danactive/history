/* global describe, expect, test */

import {
  selectMedia,
  selectPage,
  makeSelectAlbums,
  makeSelectGalleryLoading,
  makeSelectGalleryError,
} from '../selectors';

describe('selectMedia', () => {
  test('should select the mediaGallery state', () => {
    const fixture = {
      gallery: 'demo',
    };
    const mockedState = {
      mediaGallery: fixture,
    };
    expect(selectMedia(mockedState)).toEqual(fixture);
  });
});

describe('selectPage', () => {
  test('should select the page state', () => {
    const fixture = {
      galleryLoading: true,
    };
    const mockedState = {
      mediaGallery: {
        galleryViewPage: fixture,
      },
    };
    expect(selectPage(mockedState)).toEqual(fixture);
  });
});

describe('makeSelectAlbums', () => {
  const albumsSelector = makeSelectAlbums();
  test('should select the album', () => {
    const albums = ['sample'];
    const mockedState = {
      mediaGallery: {
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
      mediaGallery: {
        galleryViewPage: {
          galleryLoading,
        },
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
      mediaGallery: {
        galleryViewPage: {
          galleryError,
        },
      },
    };
    expect(galleryErrorSelector(mockedState)).toEqual(galleryError);
  });
});
