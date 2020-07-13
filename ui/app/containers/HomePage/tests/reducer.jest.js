import produce from 'immer';

import homeReducer, { initialState } from '../reducer';
import {
  loadGalleries,
  galleriesLoadingSuccess,
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
    const expectedResult = produce(state, draft => {
      draft.galleryLoadings = true;
    });

    expect(homeReducer(state, loadGalleries())).toEqual(expectedResult);
  });

  test('should handle the galleriesLoadingSuccess action correctly', () => {
    const fixture = {
      entries: [{ name: 'demo', path_lower: '/public/galleries/demo' }],
    };
    const expectedResult = produce(state, draft => {
      draft.galleryLoadings = false;
      draft.contents = fixture.entries;
    });

    expect(homeReducer(state, galleriesLoadingSuccess(fixture))).toEqual(
      expectedResult,
    );
  });

  test('should handle the galleriesLoadingError action correctly', () => {
    const fixture = { type: 'ReferenceError' };
    const expectedResult = produce(state, draft => {
      draft.galleryErrors = fixture;
      draft.host = 'cdn';
    });

    expect(homeReducer(state, galleriesLoadingError(fixture, 'cdn'))).toEqual(
      expectedResult,
    );
  });
});
