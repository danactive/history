/* eslint-disable no-param-reassign */
import produce from 'immer';

import {
  albumLoadError,
  albumLoadSuccess,
  chooseAdjacentMemory,
  loadAlbum,
  loadNextPage,
  nextPageError,
  nextPageSuccess,
} from '../actions';

import {
  LOAD_ALBUM,
  LOAD_ALBUM_ERROR,
  LOAD_ALBUM_SUCCESS,
  LOAD_NEXT_THUMB_PAGE,
  LOAD_NEXT_THUMB_PAGE_ERROR,
  LOAD_NEXT_THUMB_PAGE_SUCCESS,
  NEXT_MEMORY,
  PREV_MEMORY,
} from '../constants';

import reducer from '../../App/reducer';

describe('AlbumViewPage actions', () => {
  const fixture = {
    memories: { link: 'thumbnail.jpg' },
    error: { error: 'error', message: 'message' },
  };

  describe('Load album', () => {
    test('has an error with a type of LOAD_ALBUM_ERROR', () => {
      const expected = {
        type: LOAD_ALBUM_ERROR,
        error: fixture.error,
      };
      expect(albumLoadError({ error: fixture.error })).toEqual(expected);
    });
  });

  describe('Load next page of thumbs', () => {
    test('has an error with a type of LOAD_NEXT_THUMB_PAGE_ERROR', () => {
      const expected = {
        type: LOAD_NEXT_THUMB_PAGE_ERROR,
        error: fixture.error,
      };
      expect(nextPageError(fixture.error)).toEqual(expected);
    });
  });

  describe('Keyboard controls next or previous memory', () => {
    test('has a next memory', () => {
      const expected = {
        type: NEXT_MEMORY,
        adjacentInt: 1,
      };
      expect(chooseAdjacentMemory(1)).toEqual(expected);
    });

    test('has a previous memory', () => {
      const expected = {
        type: PREV_MEMORY,
        adjacentInt: -1,
      };
      expect(chooseAdjacentMemory(-1)).toEqual(expected);
    });
  });
});

describe('Load album hosted on Dropbox', () => {
  // memories
  const fixtures = {
    memories: [{ filename: '2017-12-25.jpg' }],
  };

  test('Page load event dispatches loadAlbum action', () => {});

  test('action loadAlbum will request with a type of LOAD_ALBUM', () => {
    const expected = {
      type: LOAD_ALBUM,
      host: 'dropbox',
      gallery: 'demo',
      album: 'sample',
    };
    expect(
      loadAlbum({ host: 'dropbox', gallery: 'demo', album: 'sample' }),
    ).toEqual(expected);
  });

  test('reducer should store the action loadAlbum', () => {
    const action = loadAlbum({
      host: 'dropbox',
      gallery: 'demo',
      album: 'sample',
    });
    const received = reducer({}, action);
    const expected = {
      host: 'dropbox',
      gallery: 'demo',
      album: 'sample',
      dropbox: {
        demo: {
          sample: {
            memories: [],
          },
        },
      },
    };

    expect(received).toEqual(expected);
  });

  test('saga worker puts albumLoadSuccess', () => {});

  test('action after successful saga with a type of LOAD_ALBUM_SUCCESS', () => {
    const sagaResult = {
      host: 'dropbox',
      gallery: 'demo',
      album: 'sample',
      memories: fixtures.memories,
    };
    const received = albumLoadSuccess(sagaResult);
    const expected = {
      type: LOAD_ALBUM_SUCCESS,
      gallery: 'demo',
      album: 'sample',
      host: 'dropbox',
      memories: fixtures.memories,
    };

    expect(received).toEqual(expected);
  });

  test('reducer should store the action albumLoadSuccess', () => {
    const state = {
      gallery: 'demo',
      album: 'sample',
      demo: {
        sample: {
          memories: [],
        },
      },
    };

    const sagaResult = {
      host: 'dropbox',
      gallery: 'demo',
      album: 'sample',
      memories: fixtures.memories,
    };
    const received = reducer(state, albumLoadSuccess(sagaResult));
    const expected = produce(state, draft => {
      draft.dropbox = {
        demo: {
          sample: {
            memories: [
              {
                filename: '2017-12-25.jpg',
              },
            ],
          },
        },
      };
    });

    expect(received).toEqual(expected);
  });
});

describe('Load next thumb page', () => {
  const fixtures = {
    host: 'dropbox',
    gallery: 'demo',
    album: 'sample',
    memories: [{ link: 'thumbnail.jpg', filename: '2017-12-25.jpg' }],
    newMemories: [{ link: 'thumbnail-two.jpg', filename: '2017-12-31.jpg' }],
    page: 2,
    error: { error: 'error', message: 'message' },
  };

  test('InfiniteScroll dispatches loadNextPage action', () => {});

  test('action loadNextPage will request with a type of LOAD_NEXT_THUMB_PAGE', () => {
    const expected = {
      type: LOAD_NEXT_THUMB_PAGE,
    };
    const received = loadNextPage();

    expect(received).toEqual(expected);
  });

  test('saga worker puts nextPageSuccess', () => {});

  test('action nextPageSuccess will request with a type of LOAD_NEXT_THUMB_PAGE_SUCCESS', () => {
    const args = {
      host: fixtures.host,
      gallery: fixtures.gallery,
      album: fixtures.album,
      newMemories: fixtures.memories,
      page: fixtures.page,
      hasMore: true,
    };
    const expected = {
      ...args,
      type: LOAD_NEXT_THUMB_PAGE_SUCCESS,
    };
    expect(nextPageSuccess(args)).toEqual(expected);
  });

  test('reducer should store the action nextPageSuccess', () => {
    const state = {
      host: 'dropbox',
      gallery: 'demo',
      album: 'sample',
      dropbox: {
        demo: {
          sample: {
            memories: fixtures.memories,
          },
        },
      },
    };

    const args = {
      host: fixtures.host,
      album: fixtures.album,
      gallery: fixtures.gallery,
      memories: fixtures.memories,
      newMemories: fixtures.newMemories,
      page: fixtures.page,
      hasMore: fixtures.hasMore,
    };

    const received = reducer(state, nextPageSuccess(args));
    const expected = produce(state, draft => {
      draft.dropbox = {
        demo: {
          sample: {
            memories: fixtures.memories.concat(fixtures.newMemories),
          },
        },
      };
    });

    expect(received).toEqual(expected);
  });
});
