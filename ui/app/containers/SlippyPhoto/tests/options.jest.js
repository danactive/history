/* global describe, expect, it, shallow */
import {
  getMapOptions,
} from '../options';

describe('SlippyPhoto options', () => {
  describe('getMapOptions', () => {
    it('should have map styles', () => {
      expect.hasAssertions();

      const received = getMapOptions().style.name;
      const expected = 'Photo';
      expect(received).toEqual(expected);
    });
  });
});
