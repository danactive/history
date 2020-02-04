/* global beforeEach, describe, expect, test */
import produce from 'immer';

import homeReducer, { initialState } from '../reducer';
import {
  loadGalleries,
  galleriesLoaded,
  galleriesLoadingError,
} from '../actions';

/* eslint-disable default-case, no-param-reassign */
describe('homeReducer', () => {
  let state;
  beforeEach(() => {
    state = initialState;
  });

  test('should return the initial state', () => {
    const expectedResult = state;
    expect(homeReducer(undefined, {})).toEqual(expectedResult);
  });

  test('should handle the loadGalleries action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.galleryLoading = true;
    });

    expect(homeReducer(state, loadGalleries())).toEqual(expectedResult);
  });

  test('should handle the galleriesLoaded action correctly', () => {
    const fixture = { entries: [{ name: 'gallery-demo', path_lower: '/public/gallery-demo' }] };
    const expectedResult = produce(state, (draft) => {
      draft.galleryLoading = false;
      draft.contents = fixture.entries;
    });

    expect(homeReducer(state, galleriesLoaded(fixture))).toEqual(expectedResult);
  });

  test('should handle the galleriesLoadingError action correctly', () => {
    const fixture = { type: 'ReferenceError' };
    const expectedResult = produce(state, (draft) => {
      draft.galleryError = fixture;
    });

    expect(homeReducer(state, galleriesLoadingError(fixture))).toEqual(expectedResult);
  });
});
