/* global beforeEach, describe, expect, test */
import produce from 'immer';

import appReducer, { initialState } from '../reducer';
import {
  albumLoadSuccess,
  chooseAdjacentMemory, loadAlbum,
} from '../../AlbumViewPage/actions';
import json from './fixtures/album';

/* eslint-disable default-case, no-param-reassign */
describe('appReducer', () => {
  let state;

  beforeEach(() => {
    state = initialState;
  });

  test('initial state', () => {
    expect(appReducer(undefined, {})).toStrictEqual(initialState);
  });

  test('loadAlbum action from AlbumViewPage', () => {
    const received = appReducer(state, loadAlbum({ host: 'dropbox', gallery: 'demo', album: 'sample' }));

    const expected = produce(state, (draft) => {
      draft.album = 'sample';
      draft.gallery = 'demo';
      draft.host = 'dropbox';
      draft.dropbox = {
        demo: {
          sample: {
            memories: [],
          },
        },
      };
    });

    expect(received).toStrictEqual(expected);
  });

  test('albumLoadSuccess action', () => {
    const testState = {
      host: 'dropbox',
      gallery: 'demo',
      album: 'sample',
    };
    const received = appReducer(testState, albumLoadSuccess({
      host: testState.host,
      gallery: testState.gallery,
      album: testState.album,
      memories: json.memories,
    }));

    const expected = produce(testState, (draft) => {
      draft.dropbox = {
        demo: {
          sample: {
            memories: json.memories,
          },
        },
      };
    });

    expect(received).toStrictEqual(expected);
  });

  describe('should handle the currentMemory action correctly', () => {
    const testState = {
      host: 'dropbox',
      gallery: 'demo',
      album: 'sample',
      dropbox: {
        demo: {
          sample: {
            memories: [
              { id: 1 },
              { id: 2 },
              { id: 3 },
            ],
          },
        },
      },
      currentMemory: {
        id: 2,
      },
    };
    test('should be one after ID two', () => {
      const expectedResult = produce(testState, (draft) => {
        draft.currentMemory.id = 3;
      });

      expect(appReducer(testState, chooseAdjacentMemory(1))).toEqual(expectedResult);
    });

    test('should be one before ID two', () => {
      const expectedResult = produce(testState, (draft) => {
        draft.currentMemory.id = 1;
      });

      expect(appReducer(testState, chooseAdjacentMemory(-1))).toEqual(expectedResult);
    });

    test('should be two after ID two', () => {
      const expectedResult = produce(testState, (draft) => {
        draft.currentMemory.id = 1;
      });

      expect(appReducer(testState, chooseAdjacentMemory(2))).toEqual(expectedResult);
    });

    test('should be two before ID two', () => {
      const expectedResult = produce(testState, (draft) => {
        draft.currentMemory.id = 3;
      });

      expect(appReducer(testState, chooseAdjacentMemory(-2))).toEqual(expectedResult);
    });
  });
});
