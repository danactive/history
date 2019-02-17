/* global describe, expect, test */
import { fromJS } from 'immutable';
import galleryViewPageReducer from '../reducer';

describe('galleryViewPageReducer', () => {
  test('returns the initial state', () => {
    expect(galleryViewPageReducer(undefined, {})).toEqual(fromJS({
      galleryError: false,
      galleryLoading: false,
    }));
  });
});
