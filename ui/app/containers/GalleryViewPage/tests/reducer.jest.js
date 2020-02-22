/* global beforeEach, describe, expect, test */
import produce from 'immer';

import galleryViewPageReducer, { initialState } from '../reducer';
import {
  loadGallery,
} from '../actions';

/* eslint-disable default-case, no-param-reassign */
describe('galleryViewPageReducer', () => {
  let state;
  beforeEach(() => {
    state = initialState;
  });

  test('should return the initial state', () => {
    const expectedResult = state;
    expect(galleryViewPageReducer(undefined, {})).toEqual(expectedResult);
  });

  test('should handle the loadGalleries action correctly', () => {
    const fixture = 'demo';
    const expectedResult = produce(state, (draft) => {
      draft.galleryLoading = true;
      draft.galleryError = false;
      draft.gallery = fixture;
    });

    expect(galleryViewPageReducer(state, loadGallery({ host: 'dropbox', gallery: fixture }))).toEqual(expectedResult);
  });
});
