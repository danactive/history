/* global describe, expect, test */
import {
  LOAD_GALLERIES,
  LOAD_GALLERIES_SUCCESS,
  LOAD_GALLERIES_ERROR,
} from '../constants';

import {
  loadGalleries,
  galleriesLoadingSuccess,
  galleriesLoadingError,
} from '../actions';

describe('Home Actions', () => {
  test('loadGalleries', () => {
    const expectedResult = {
      type: LOAD_GALLERIES,
    };

    expect(loadGalleries()).toEqual(expectedResult);
  });

  test('galleriesLoadingSuccess', () => {
    const galleries = ['gallery'];
    const expectedResult = {
      galleries,
      type: LOAD_GALLERIES_SUCCESS,
    };

    expect(galleriesLoadingSuccess(galleries)).toEqual(expectedResult);
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
