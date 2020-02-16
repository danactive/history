/* global beforeEach, describe, expect, test */
import produce from 'immer';

import json from '../../App/tests/fixtures/album';
import pageReducer, { initialState } from '../reducer';
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
  const fixture = {
    gallery: 'demo',
    page: 0,
    hasMore: true,
    error: { message: 'Bad request' },
    memories: json.memories,
  };

  beforeEach(() => {
    state = initialState;
  });

  test('initial state', () => {
    expect(pageReducer(undefined, {})).toStrictEqual(initialState);
  });

  test('loadAlbum action', () => {
    const received = pageReducer(state, loadAlbum());

    const expected = produce(state, (draft) => {
      draft.albumLoading = true;
    });

    expect(received).toEqual(expected);
  });

  test('albumLoadSuccess action', () => {
    const received = pageReducer(state, albumLoadSuccess(json.memories));

    const expected = produce(state, (draft) => {
      draft.albumLoading = false;
      draft.thumbsLoading = true;
      draft.page = fixture.page;
      draft.hasMore = fixture.hasMore;
    });

    expect(received).toStrictEqual(expected);
  });

  test('should handle the albumLoadError action correctly', () => {
    const received = pageReducer(state, albumLoadError(fixture.error));

    const expected = produce(state, (draft) => {
      draft.albumError = fixture.error;
      draft.albumLoading = false;
    });

    expect(received).toEqual(expected);
  });

  test('should handle the nextPageSuccess action correctly', () => {
    const args = {
      gallery: fixture.gallery,
      thumbs: fixture.thumbs,
      metaThumbs: fixture.metaThumbs,
      page: fixture.page,
      hasMore: fixture.hasMore,
    };
    const received = pageReducer(state, nextPageSuccess(args));

    const expected = produce(state, (draft) => {
      draft.thumbsLoading = false;
      draft.page = fixture.page;
      draft.hasMore = fixture.hasMore;
    });

    expect(received).toEqual(expected);
  });

  test('should handle the nextPageError action correctly', () => {
    const received = pageReducer(state, nextPageError(fixture.error));

    const expected = produce(state, (draft) => {
      draft.thumbsError = fixture.error;
      draft.thumbsLoading = false;
    });

    expect(received).toEqual(expected);
  });

  test('should handle the thumbsLoaded action correctly', () => {
    const received = pageReducer(state, thumbsLoaded(fixture.error));

    const expected = produce(state, (draft) => {
      draft.thumbsLoading = false;
      delete draft.page;
      delete draft.hasMore;
    });

    expect(received).toEqual(expected);
  });
});
