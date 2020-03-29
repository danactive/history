/* global describe, expect, test */
import { determineAdjacentInCarousel } from '../saga';

/* eslint-disable default-case, no-param-reassign */
describe('InfiniteThumbs Saga', () => {
  describe('determineAdjacentInCarousel', () => {
    describe('should handle the currentMemory action correctly', () => {
      const testState = {
        memories: [
          { id: 1 },
          { id: 2 },
          { id: 3 },
        ],
        currentMemory: {
          id: 2,
        },
      };

      test('should be one after ID two', () => {
        expect(determineAdjacentInCarousel({ adjacentInt: 1, ...testState })).toEqual(3);
      });

      test('should be one before ID two', () => {
        expect(determineAdjacentInCarousel({ adjacentInt: -1, ...testState })).toEqual(1);
      });

      test('should be two after ID two', () => {
        expect(determineAdjacentInCarousel({ adjacentInt: 2, ...testState })).toEqual(1);
      });

      test('should be two before ID two', () => {
        expect(determineAdjacentInCarousel({ adjacentInt: -2, ...testState })).toEqual(3);
      });
    });
  });
});
