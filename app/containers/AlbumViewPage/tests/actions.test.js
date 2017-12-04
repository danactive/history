import {
  albumLoadError,
  nextPageError,
  thumbsLoaded,
} from '../actions';

import {
  LOAD_ALBUM_ERROR,
  LOAD_NEXT_THUMB_PAGE_ERROR,
  LOAD_THUMBS_SUCCESS,
} from '../constants';

describe('AlbumViewPage actions', () => {
  const fixture = {
    thumbs: { link: 'thumbnail.jpg' },
    error: { error: 'error', message: 'message' },
  };

  describe('Load album', () => {
    it('has an error with a type of LOAD_ALBUM_ERROR', () => {
      const expected = {
        type: LOAD_ALBUM_ERROR,
        error: fixture.error,
      };
      expect(albumLoadError(fixture.error)).toEqual(expected);
    });
  });

  describe('Load next page of thumbs', () => {
    it('has an error with a type of LOAD_NEXT_THUMB_PAGE_ERROR', () => {
      const expected = {
        type: LOAD_NEXT_THUMB_PAGE_ERROR,
        error: fixture.error,
      };
      expect(nextPageError(fixture.error)).toEqual(expected);
    });
  });

  describe('Load final page of thumbs', () => {
    it('has will request with a type of LOAD_THUMBS_SUCCESS', () => {
      const expected = {
        type: LOAD_THUMBS_SUCCESS,
        thumbs: fixture.thumbs,
      };
      expect(thumbsLoaded(fixture.thumbs)).toEqual(expected);
    });
  });
});
