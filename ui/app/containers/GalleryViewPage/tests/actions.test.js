/* global describe, expect, test */
import {
  loadGallery,
} from '../actions';

import {
  LOAD_GALLERY,
} from '../constants';

describe('GalleryViewPage actions', () => {
  describe('loadGallery', () => {
    test('has a type of LOAD_GALLERY', () => {
      const gallery = 'default';
      const expected = {
        type: LOAD_GALLERY,
        gallery,
      };
      expect(loadGallery(gallery)).toEqual(expected);
    });
  });
});
