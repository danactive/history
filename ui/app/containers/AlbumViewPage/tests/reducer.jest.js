/* global beforeEach, describe, expect, test */
import produce from 'immer';

import pageReducer from '../reducer';
import {
  loadAlbum,
  albumLoadSuccess,
  albumLoadError,
  nextPageSuccess,
  nextPageError,
  thumbsLoaded,
} from '../actions';

/* eslint-disable default-case, no-param-reassign */
describe('pageReducer', () => {
  let state;
  const fixtures = {
    gallery: 'demo',
    page: 0,
    hasMore: true,
    error: { message: 'Bad request' },
  };

  beforeEach(() => {
    state = {
      albumLoading: false,
      albumError: false,
      thumbsLoading: false,
      thumbsError: false,
    };
  });

  test('should return the initial state', () => {
    const expected = {
      albumLoading: false,
      albumError: false,
      thumbsLoading: false,
      thumbsError: false,
    };
    expect(pageReducer(undefined, {})).toEqual(expected);
  });

  test('should handle the loadAlbum action correctly', () => {
    const received = pageReducer(state, loadAlbum(`?gallery=${fixtures.gallery}&another=false`, 'sample'));

    const expected = produce(state, (draft) => {
      draft.albumLoading = true;
    });

    expect(received).toEqual(expected);
  });

  test('should handle the albumLoadSuccess action correctly', () => {
    const received = pageReducer(state, albumLoadSuccess(fixtures.gallery, 'sample'));

    const expected = produce(state, (draft) => {
      draft.albumLoading = false;
      draft.thumbsLoading = true;
      draft.page = fixtures.page;
      draft.hasMore = fixtures.hasMore;
    });

    expect(received).toEqual(expected);
  });

  test('should handle the albumLoadError action correctly', () => {
    const received = pageReducer(state, albumLoadError(fixtures.error));

    const expected = produce(state, (draft) => {
      draft.albumError = fixtures.error;
      draft.albumLoading = false;
    });

    expect(received).toEqual(expected);
  });

  test('should handle the nextPageSuccess action correctly', () => {
    const args = {
      gallery: fixtures.gallery,
      thumbs: fixtures.thumbs,
      metaThumbs: fixtures.metaThumbs,
      page: fixtures.page,
      hasMore: fixtures.hasMore,
    };
    const received = pageReducer(state, nextPageSuccess(args));

    const expected = produce(state, (draft) => {
      draft.thumbsLoading = false;
      draft.page = fixtures.page;
      draft.hasMore = fixtures.hasMore;
    });

    expect(received).toEqual(expected);
  });

  test('should handle the nextPageError action correctly', () => {
    const received = pageReducer(state, nextPageError(fixtures.error));

    const expected = produce(state, (draft) => {
      draft.thumbsError = fixtures.error;
      draft.thumbsLoading = false;
    });

    expect(received).toEqual(expected);
  });

  test('should handle the thumbsLoaded action correctly', () => {
    const received = pageReducer(state, thumbsLoaded(fixtures.error));

    const expected = produce(state, (draft) => {
      draft.thumbsLoading = false;
      delete draft.page;
      delete draft.hasMore;
    });

    expect(received).toEqual(expected);
  });
});
