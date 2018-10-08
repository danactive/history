import {
  chooseMemory,
} from '../actions';

import {
  CHOOSE_MEMORY,
} from '../constants';

describe('InfiniteThumbs actions', () => {
  describe('Choose memory', () => {
    it('has will request with a type of CHOOSE_MEMORY', () => {
      const expected = {
        type: CHOOSE_MEMORY,
        id: 911,
      };
      expect(chooseMemory(911)).toEqual(expected);
    });
  });
});
