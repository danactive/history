import { fromJS } from 'immutable';

import {
  loadAlbum,
  albumLoadSuccess,
  loadNextPage,
  nextPageSuccess,
} from '../actions';

import {
  LOAD_ALBUM,
  LOAD_ALBUM_SUCCESS,
  LOAD_NEXT_THUMB_PAGE,
  LOAD_NEXT_THUMB_PAGE_SUCCESS,
} from '../constants';

import { albumReducer } from '../reducer';

let state;

describe('Load album hosted on Dropbox', () => {
  const fixtures = {
    thumbs: { link: 'thumbnail.jpg' },
    metaThumbs: { filename: '2017-12-25.jpg' },
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
    const received = albumReducer(fromJS({}), loadAlbum('?gallery=demo', 'sample'));
    const expected = fromJS({})
      .set('gallery', 'demo')
      .set('album', 'sample')
      .setIn(['demo', 'sample', 'metaThumbs'], [])
      .setIn(['demo', 'sample', 'thumbs'], []);

    expect(received).toEqual(expected);
    state = expected;
  });

  it('saga worker puts albumLoadSuccess', () => {});

  it('action after successful saga with a type of LOAD_ALBUM_SUCCESS', () => {
    const sagaResult = {
      gallery: 'demo',
      album: 'sample',
      metaThumbs: fixtures.metaThumbs,
    };
    const received = albumLoadSuccess(sagaResult);
    const expected = {
      type: LOAD_ALBUM_SUCCESS,
      gallery: 'demo',
      album: 'sample',
      metaThumbs: fixtures.metaThumbs,
    };

    expect(received).toEqual(expected);
  });

  it('reducer should store the action albumLoadSuccess', () => {
    const sagaResult = {
      gallery: 'demo',
      album: 'sample',
      metaThumbs: fixtures.metaThumbs,
    };
    const received = albumReducer(state, albumLoadSuccess(sagaResult));
    const expected = state
      .setIn(['demo', 'sample', 'metaThumbs'], fixtures.metaThumbs)
      .setIn(['demo', 'sample', 'thumbs'], []);

    expect(received).toEqual(expected);
    state = expected;
  });
});

describe('Load next thumb page', () => {
  const fixtures = {
    gallery: 'demo',
    album: 'sample',
    thumbs: { link: 'thumbnail.jpg' },
    metaThumbs: { filename: '2017-12-25.jpg' },
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
      thumbs: fixtures.thumbs,
      metaThumbs: fixtures.metaThumbs,
      page: fixtures.page,
      hasMore: false,
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
      thumbs: fixtures.thumbs,
      metaThumbs: fixtures.metaThumbs,
      page: fixtures.page,
      hasMore: fixtures.hasMore,
    };

    const received = albumReducer(state, nextPageSuccess(args));
    const expected = state
      .setIn([gallery, album, 'thumbs'], fixtures.thumbs);

    expect(received).toEqual(expected);
  });
});
