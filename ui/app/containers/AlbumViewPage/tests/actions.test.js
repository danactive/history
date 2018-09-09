import {
  albumLoadError,
  chooseAdjacentMemory,
  nextPageError,
} from '../actions';

import {
  LOAD_ALBUM_ERROR,
  LOAD_NEXT_THUMB_PAGE_ERROR,
  PREV_MEMORY,
  NEXT_MEMORY,
} from '../constants';

describe('AlbumViewPage actions', () => {
  const fixture = {
    memories: { link: 'thumbnail.jpg' },
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

  describe('Keyboard controls next or previous memory', () => {
    it('has a next memory', () => {
      const expected = {
        type: NEXT_MEMORY,
        adjacentInt: 1,
      };
      expect(chooseAdjacentMemory(1)).toEqual(expected);
    });

    it('has a previous memory', () => {
      const expected = {
        type: PREV_MEMORY,
        adjacentInt: -1,
      };
      expect(chooseAdjacentMemory(-1)).toEqual(expected);
    });
  });
});
