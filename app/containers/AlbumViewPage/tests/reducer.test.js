import { fromJS } from 'immutable';

import pageReducer, { albumReducer } from '../reducer';
import {
  loadAlbum,
  albumLoadSuccess,
  albumLoadError,
  nextPageSuccess,
  nextPageError,
  thumbsLoaded,
} from '../actions';

describe('pageReducer', () => {
  let state;
  const fixtures = {
    gallery: 'demo',
    page: 1,
    hasMore: true,
    error: { message: 'Bad request' },
  };

  beforeEach(() => {
    state = fromJS({
      albumLoading: false,
      albumError: false,
      thumbsLoading: false,
      thumbsError: false,
    });
  });

  it('should return the initial state', () => {
    const expected = state;
    expect(pageReducer(undefined, {})).toEqual(expected);
  });

  it('should handle the loadAlbum action correctly', () => {
    const received = pageReducer(state, loadAlbum(`?gallery=${fixtures.gallery}&another=false`, 'sample'));
    const expected = state.set('albumLoading', true);

    expect(received).toEqual(expected);
  });

  it('should handle the albumLoadSuccess action correctly', () => {
    const received = pageReducer(state, albumLoadSuccess(fixtures.gallery, 'sample'));
    const expected = state
      .set('albumLoading', false)
      .set('thumbsLoading', true)
      .set('page', fixtures.page)
      .set('hasMore', fixtures.hasMore);

    expect(received).toEqual(expected);
  });

  it('should handle the albumLoadError action correctly', () => {
    const received = pageReducer(state, albumLoadError(fixtures.error));
    const expected = state
      .set('albumError', fixtures.error)
      .set('albumLoading', false);

    expect(received).toEqual(expected);
  });

  it('should handle the nextPageSuccess action correctly', () => {
    const args = {
      gallery: fixtures.gallery,
      thumbs: fixtures.thumbs,
      metaThumbs: fixtures.metaThumbs,
      page: fixtures.page,
      hasMore: fixtures.hasMore,
    };
    const received = pageReducer(state, nextPageSuccess(args));
    const expected = state
      .set('thumbsLoading', false)
      .set('page', fixtures.page)
      .set('hasMore', fixtures.hasMore);

    expect(received).toEqual(expected);
  });

  it('should handle the nextPageError action correctly', () => {
    const received = pageReducer(state, nextPageError(fixtures.error));
    const expected = state
      .set('thumbsError', fixtures.error)
      .set('thumbsLoading', false);

    expect(received).toEqual(expected);
  });

  it('should handle the thumbsLoaded action correctly', () => {
    const received = pageReducer(state, thumbsLoaded(fixtures.error));
    const expected = state
      .set('thumbsLoading', false)
      .remove('page')
      .remove('hasMore');

    expect(received).toEqual(expected);
  });
});

describe('albumReducer', () => {
  let state;
  const fixtures = {
    gallery: 'demo',
    album: 'sample',
    metaThumbs: { filename: '2017-12-25.jpg' },
    page: 1,
    hasMore: true,
    error: { message: 'Bad request' },
  };

  beforeEach(() => {
    state = fromJS({
      demo: {
        sample: {
          thumbs: [],
          metaThumbs: [],
        },
      },
    });
  });

  it('should return the initial state', () => {
    const expected = state;
    expect(albumReducer(undefined, {})).toEqual(expected);
  });

  it('should handle the thumbsLoaded action correctly', () => {
    const gallery = state.get('gallery');
    const album = state.get('album');
    const received = albumReducer(state, thumbsLoaded(fixtures.thumbs));
    const expected = state
      .setIn([gallery, album, 'thumbs'], fixtures.thumbs)
      .deleteIn([gallery, album, 'metaThumbs']);

    expect(received).toEqual(expected);
  });
});
