/* global describe, expect, test */

import {
  selectAlbum,
  selectPage,
  makeSelectAlbumLoading,
  makeSelectAlbumError,
  makeSelectAlbumName,
  makeSelectMemories,
  selectNextPage,
} from '../selectors';

describe('Memorized selectors', () => {
  test('should select the album view page state', () => {
    const pageState = {
      albumLoading: false,
    };
    const mockedState = {
      albumViewPage: pageState,
    };
    const received = selectPage(mockedState);
    const expected = pageState;
    expect(received).toEqual(expected);
  });

  test('should select the album state', () => {
    const albumState = {
      thumbs: [],
    };
    const mockedState = {
      albums: albumState,
    };
    const received = selectAlbum(mockedState);
    const expected = albumState;
    expect(received).toEqual(expected);
  });
});

describe('makeSelectAlbumLoading', () => {
  const albumLoadingSelector = makeSelectAlbumLoading();
  test('should select the album loading boolean', () => {
    const mockedState = {
      albumViewPage: {
        albumLoading: false,
      },
    };
    expect(albumLoadingSelector(mockedState)).toEqual(false);
  });
});

describe('makeSelectAlbumError', () => {
  const albumErrorSelector = makeSelectAlbumError();
  test('should select the album error message', () => {
    const mockedState = {
      albumViewPage: {
        albumError: false,
      },
    };
    expect(albumErrorSelector(mockedState)).toEqual(false);
  });
});

describe('makeSelectAlbumName', () => {
  const albumNameSelector = makeSelectAlbumName();
  test('should select the album error message', () => {
    const album = 'sample';
    const mockedState = {
      albums: {
        album,
      },
    };
    expect(albumNameSelector(mockedState)).toEqual(album);
  });
});

describe('makeSelectMemories', () => {
  const memoriesSelector = makeSelectMemories();
  test('should select the album memories', () => {
    const mockedState = {
      albums: {
        gallery: 'demo',
        album: 'sample',
        demo: {
          sample: {
            memories: [{ filename: '2017-12-25.jpg' }],
          },
        },
      },
    };
    const expected = [{ filename: '2017-12-25.jpg' }];
    expect(memoriesSelector(mockedState)).toEqual(expected);
  });
});

describe('selectNextPage', () => {
  test('should select the next page', () => {
    const mockedState = {
      albumViewPage: {
        page: 1,
      },
      albums: {
        gallery: 'demo',
        album: 'sample',
        demo: {
          sample: {
            memories: [],
          },
        },
      },
    };
    const expected = {
      gallery: 'demo',
      album: 'sample',
      memories: [],
      page: 1,
    };
    expect(selectNextPage(mockedState)).toEqual(expected);
  });
});
