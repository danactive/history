import { determineAdjacentInCarousel } from '../saga';

/* eslint-disable default-case, no-param-reassign */
describe('InfiniteThumbs Saga', () => {
  describe('determineAdjacentInCarousel', () => {
    describe('Single use input', () => {
      const testState = {
        memories: [{ id: 1 }, { id: 2 }, { id: 3 }],
        currentMemory: {
          id: 2,
        },
      };

      test('should be one after ID two', () => {
        const expected = determineAdjacentInCarousel({
          adjacentInt: 1,
          ...testState,
        });
        expect(expected.id).toEqual(3);
        expect(expected.index).toEqual(2);
      });

      test('should be one before ID two', () => {
        const expected = determineAdjacentInCarousel({
          adjacentInt: -1,
          ...testState,
        });
        expect(expected.id).toEqual(1);
        expect(expected.index).toEqual(0);
      });

      test('should be two after ID two', () => {
        const expected = determineAdjacentInCarousel({
          adjacentInt: 2,
          ...testState,
        });
        expect(expected.id).toEqual(1);
        expect(expected.index).toEqual(0);
      });

      test('should be two before ID two', () => {
        const expected = determineAdjacentInCarousel({
          adjacentInt: -2,
          ...testState,
        });
        expect(expected.id).toEqual(3);
        expect(expected.index).toEqual(2);
      });
    });

    describe('Deeper input', () => {
      const testState = {
        memories: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
        currentMemory: {
          id: 2,
        },
      };

      test('should be one after ID two', () => {
        const expected = determineAdjacentInCarousel({
          adjacentInt: 1,
          ...testState,
        });
        expect(expected.id).toEqual(3);
        expect(expected.index).toEqual(2);
      });

      test('should be two after ID two', () => {
        const expected = determineAdjacentInCarousel({
          adjacentInt: 2,
          ...testState,
        });
        expect(expected.id).toEqual(4);
        expect(expected.index).toEqual(3);
      });
    });
  });
});
