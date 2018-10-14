import { fromJS } from 'immutable';

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

let state;

describe('AlbumViewPage actions', () => {
  const fixture = {
    memories: { link: 'thumbnail.jpg' },
    error: { error: 'error', message: 'message' },
  };

  describe('Load album', () => {
    it('has an error with a type of LOAD_ALBUM_ERROR', () => {
      const expected = {
        type: LOAD_ALBUM_ERROR,
        error: fixture.error,
      };
      expect(albumLoadError(fixture.error)).toEqual(expected);
    });
  });

  describe('Load next page of thumbs', () => {
    it('has an error with a type of LOAD_NEXT_THUMB_PAGE_ERROR', () => {
      const expected = {
        type: LOAD_NEXT_THUMB_PAGE_ERROR,
        error: fixture.error,
      };
      expect(nextPageError(fixture.error)).toEqual(expected);
    });
  });

  describe('Keyboard controls next or previous memory', () => {
    it('has a next memory', () => {
      const expected = {
        type: NEXT_MEMORY,
        adjacentInt: 1,
      };
      expect(chooseAdjacentMemory(1)).toEqual(expected);
    });

    it('has a previous memory', () => {
      const expected = {
        type: PREV_MEMORY,
        adjacentInt: -1,
      };
      expect(chooseAdjacentMemory(-1)).toEqual(expected);
    });
  });
});

describe('Load album hosted on Dropbox', () => {
  const fixtures = {
    memories: { filename: '2017-12-25.jpg' },
  };

  it('Page load event dispatches loadAlbum action', () => {});

  it('action loadAlbum will request with a type of LOAD_ALBUM', () => {
    const expected = {
      type: LOAD_ALBUM,
      gallery: 'demo',
      album: 'sample',
    };
    expect(loadAlbum('?fake=true&gallery=demo&third=true', 'sample')).toEqual(expected);
    expect(loadAlbum('?gallery=demo&another=true', 'sample')).toEqual(expected);
  });

  it('reducer should store the action loadAlbum', () => {
    const received = reducer(fromJS({}), loadAlbum('?gallery=demo', 'sample'));
    const expected = fromJS({})
      .set('gallery', 'demo')
      .set('album', 'sample')
      .setIn(['demo', 'sample', 'memories'], []);

    expect(received).toEqual(expected);
    state = expected;
  });

  it('saga worker puts albumLoadSuccess', () => {});

  it('action after successful saga with a type of LOAD_ALBUM_SUCCESS', () => {
    const sagaResult = {
      gallery: 'demo',
      album: 'sample',
      memories: fixtures.memories,
    };
    const received = albumLoadSuccess(sagaResult);
    const expected = {
      type: LOAD_ALBUM_SUCCESS,
      gallery: 'demo',
      album: 'sample',
      memories: fixtures.memories,
    };

    expect(received).toEqual(expected);
  });

  it('reducer should store the action albumLoadSuccess', () => {
    const sagaResult = {
      gallery: 'demo',
      album: 'sample',
      memories: fixtures.memories,
    };
    const received = reducer(state, albumLoadSuccess(sagaResult));
    const expected = state
      .setIn(['demo', 'sample', 'memories'], fixtures.memories);

    expect(received).toEqual(expected);
    state = expected;
  });
});

describe('Load next thumb page', () => {
  const fixtures = {
    gallery: 'demo',
    album: 'sample',
    memories: { link: 'thumbnail.jpg', filename: '2017-12-25.jpg' },
    page: 2,
    error: { error: 'error', message: 'message' },
  };

  it('InfiniteScroll dispatches loadNextPage action', () => {});

  it('action loadNextPage will request with a type of LOAD_NEXT_THUMB_PAGE', () => {
    const expected = {
      type: LOAD_NEXT_THUMB_PAGE,
    };
    const received = loadNextPage();

    expect(received).toEqual(expected);
  });

  it('saga worker puts nextPageSuccess', () => {});

  it('action nextPageSuccess will request with a type of LOAD_NEXT_THUMB_PAGE_SUCCESS', () => {
    const args = {
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

  it('reducer should store the action nextPageSuccess', () => {
    const gallery = state.get('gallery');
    const album = state.get('album');
    const args = {
      gallery: fixtures.gallery,
      memories: fixtures.memories,
      page: fixtures.page,
      hasMore: fixtures.hasMore,
    };

    const received = reducer(state, nextPageSuccess(args));
    const expected = state
      .setIn([gallery, album, 'memories'], fixtures.memories);

    expect(received).toEqual(expected);
  });
});
