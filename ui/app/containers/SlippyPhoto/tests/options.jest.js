import getMapOptions from '../options';

describe('SlippyPhoto options', () => {
  describe('getMapOptions', () => {
    test('should have map styles', () => {
      expect.hasAssertions();

      const received = getMapOptions().style.name;
      const expected = 'Photo';
      expect(received).toEqual(expected);
    });
  });
});
