/* global beforeEach, describe, expect, test */
import produce from 'immer';

import appReducer from '../reducer';
import {
  chooseAdjacentMemory,
} from '../../AlbumViewPage/actions';

/* eslint-disable default-case, no-param-reassign */
describe('appReducer', () => {
  let state;
  beforeEach(() => {
    state = {
      gallery: 'demo',
      album: 'sample',
      currentMemory: {
        id: 2,
      },
      demo: {
        sample: {
          memories: [
            { id: 1 },
            { id: 2 },
            { id: 3 },
          ],
        },
      },
    };
  });

  test('should return the initial state', () => {
    const expectedResult = {
      gallery: 'demo',
      album: 'sample',
      demo: {
        sample: {
          memories: [],
        },
      },
    };
    expect(appReducer(undefined, {})).toEqual(expectedResult);
  });

  describe('should handle the currentMemory action correctly', () => {
    test('should be one after ID two', () => {
      const expectedResult = produce(state, (draft) => {
        draft.currentMemory.id = 3;
      });

      expect(appReducer(state, chooseAdjacentMemory(1))).toEqual(expectedResult);
    });

    test('should be one before ID two', () => {
      const expectedResult = produce(state, (draft) => {
        draft.currentMemory.id = 1;
      });

      expect(appReducer(state, chooseAdjacentMemory(-1))).toEqual(expectedResult);
    });

    test('should be two after ID two', () => {
      const expectedResult = produce(state, (draft) => {
        draft.currentMemory.id = 1;
      });

      expect(appReducer(state, chooseAdjacentMemory(2))).toEqual(expectedResult);
    });

    test('should be two before ID two', () => {
      const expectedResult = produce(state, (draft) => {
        draft.currentMemory.id = 3;
      });

      expect(appReducer(state, chooseAdjacentMemory(-2))).toEqual(expectedResult);
    });
  });
});
