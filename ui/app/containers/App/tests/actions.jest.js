/* global describe, expect, test */

import {
  CHOOSE_MEMORY,
  LOAD_PHOTO_ERROR,
  LOAD_PHOTO_SUCCESS,
} from '../constants';

import {
  chooseMemory,
  photoLoadError,
  photoLoadSuccess,
} from '../actions';


describe('App Actions', () => {
  describe('chooseMemory', () => {
    test('should return the correct type and id', () => {
      const fixture = 911;
      const expectedResult = {
        type: CHOOSE_MEMORY,
        id: fixture,
      };

      expect(chooseMemory({ id: fixture })).toEqual(expectedResult);
    });
  });

  describe('photoLoadSuccess', () => {
    test('should return the correct type and the passed galleries', () => {
      const fixtures = {
        album: 'sample',
        gallery: 'demo',
        id: 911,
        photoLink: '/address/picture.jpg',
      };
      const expectedResult = {
        type: LOAD_PHOTO_SUCCESS,
        ...fixtures,
      };

      expect(photoLoadSuccess(fixtures)).toEqual(expectedResult);
    });
  });

  describe('photoLoadError', () => {
    test('should return the correct type and the error', () => {
      const fixture = {
        msg: 'Something went wrong!',
      };
      const expectedResult = {
        type: LOAD_PHOTO_ERROR,
        error: fixture,
      };

      expect(photoLoadError(fixture)).toEqual(expectedResult);
    });
  });
});
