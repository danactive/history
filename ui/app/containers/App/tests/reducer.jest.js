import { fromJS } from 'immutable';

import albumReducer from '../reducer';
import {
  PREV_MEMORY,
  NEXT_MEMORY,
} from '../../AlbumViewPage/constants';

describe('appReducer', () => {
  it('should return the initial state', () => {
    const action = {};
    const state = undefined;
    const expected = fromJS({
      albums: {
        demo: {
          sample: {
            memories: [],
          },
        },
      },
    }).get('albums');
    const actual = albumReducer(state, action);
    expect(actual).toEqual(expected);
  });

  describe('should return currentMemory', () => {
    function getState() {
      const stateWithImmutableMemories = fromJS({
        albums: {
          gallery: 'demo',
          album: 'sample',
          currentMemory: {
            id: 2,
          },
          demo: {
            sample: {
              memories: [],
            },
          },
        },
      }).get('albums');

      return stateWithImmutableMemories.setIn(
        ['demo', 'sample', 'memories'],
        [
          { id: 1 },
          { id: 2 },
          { id: 3 },
        ]
      );
    }

    it('should be one after ID two', () => {
      const stateWithArrayMemories = getState();
      const action = {
        type: NEXT_MEMORY,
        adjacentInt: 1,
      };
      const actual = albumReducer(stateWithArrayMemories, action).get('currentMemory');
      const expected = fromJS({
        id: 3,
      });

      expect(actual).toEqual(expected);
    });

    it('should be one before ID two', () => {
      const stateWithArrayMemories = getState();
      const action = {
        type: PREV_MEMORY,
        adjacentInt: -1,
      };
      const actual = albumReducer(stateWithArrayMemories, action).get('currentMemory');
      const expected = fromJS({
        id: 1,
      })

      expect(actual).toEqual(expected);
    });

    it('should be two after ID two', () => {
      const stateWithArrayMemories = getState();
      const action = {
        type: NEXT_MEMORY,
        adjacentInt: 2,
      };
      const actual = albumReducer(stateWithArrayMemories, action).get('currentMemory');
      const expected = fromJS({
        id: 1,
      })

      expect(actual).toEqual(expected);
    });

    it('should be two before ID two', () => {
      const stateWithArrayMemories = getState();
      const action = {
        type: PREV_MEMORY,
        adjacentInt: -2,
      };
      const actual = albumReducer(stateWithArrayMemories, action).get('currentMemory');
      const expected = fromJS({
        id: 3,
      })

      expect(actual).toEqual(expected);
    });
  });
});
