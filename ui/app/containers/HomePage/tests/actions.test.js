/* global describe, expect, test */
import {
  LOAD_GALLERIES,
  LOAD_GALLERIES_SUCCESS,
  LOAD_GALLERIES_ERROR,
} from '../constants';

import {
  loadGalleries,
  galleriesLoaded,
  galleriesLoadingError,
} from '../actions';

describe('Home Actions', () => {
  test('loadGalleries', () => {
    const expectedResult = {
      type: LOAD_GALLERIES,
    };

    expect(loadGalleries()).toEqual(expectedResult);
  });

  test('galleriesLoaded', () => {
    const galleries = ['gallery'];
    const expectedResult = {
      galleries,
      type: LOAD_GALLERIES_SUCCESS,
    };

    expect(galleriesLoaded(galleries)).toEqual(expectedResult);
  });

  test('galleriesLoadingError', () => {
    const error = { type: 'Bad' };
    const expectedResult = {
      error,
      type: LOAD_GALLERIES_ERROR,
    };

    expect(galleriesLoadingError(error)).toEqual(expectedResult);
  });
});
