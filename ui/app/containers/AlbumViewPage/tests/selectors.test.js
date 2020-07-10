import {
  selectGlobal,
  selectPage,
  selectAlbumLoading,
  selectAlbumError,
  selectAlbumName,
  selectMemories,
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

  test('should select the global state', () => {
    const globalState = {
      gallery: 'demo',
    };
    const mockedState = {
      global: globalState,
    };
    const received = selectGlobal(mockedState);
    const expected = globalState;
    expect(received).toEqual(expected);
  });
});

describe('selectAlbumLoading', () => {
  test('should select the album loading boolean', () => {
    const mockedState = {
      albumViewPage: {
        albumLoading: false,
      },
    };
    expect(selectAlbumLoading(mockedState)).toEqual(false);
  });
});

describe('selectAlbumError', () => {
  test('should select the album error message', () => {
    const mockedState = {
      albumViewPage: {
        albumError: false,
      },
    };
    expect(selectAlbumError(mockedState)).toEqual({
      albumError: false,
      albumErrorMsg: undefined,
    });
  });
});

describe('selectAlbumName', () => {
  test('should select the album error message', () => {
    const album = 'sample';
    const mockedState = {
      global: {
        album,
      },
    };
    expect(selectAlbumName(mockedState)).toEqual(album);
  });
});

describe('selectMemories', () => {
  test('should select the album memories', () => {
    const mockedState = {
      global: {
        host: 'cdn',
        gallery: 'demo',
        album: 'sample',
        cdn: {
          demo: {
            sample: {
              memories: [{ filename: '2017-12-25.jpg' }],
            },
          },
        },
      },
    };
    const expected = [{ filename: '2017-12-25.jpg' }];
    expect(selectMemories(mockedState)).toEqual(expected);
  });
});

describe('selectNextPage', () => {
  test('should select the next page', () => {
    const mockedState = {
      albumViewPage: {
        page: 1,
      },
      global: {
        host: 'cdn',
        gallery: 'demo',
        album: 'sample',
        cdn: {
          demo: {
            sample: {
              memories: [],
            },
          },
        },
      },
    };
    const expected = {
      host: 'cdn',
      gallery: 'demo',
      album: 'sample',
      memories: [],
      page: 1,
    };
    expect(selectNextPage(mockedState)).toEqual(expected);
  });
});
