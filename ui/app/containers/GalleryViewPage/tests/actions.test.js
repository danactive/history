import { loadGallery } from '../actions';

import { LOAD_GALLERY } from '../constants';

describe('GalleryViewPage actions', () => {
  describe('loadGallery', () => {
    test('has a type of LOAD_GALLERY', () => {
      const gallery = 'demo';
      const host = 'dropbox';
      const expected = {
        type: LOAD_GALLERY,
        gallery,
        host,
      };
      expect(loadGallery({ host, gallery })).toEqual(expected);
    });
  });
});
