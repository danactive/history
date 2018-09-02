import { fromJS } from 'immutable';

import albumReducer from '../reducer';
import {
  PREV_MEMORY,
  NEXT_MEMORY,
} from '../../AlbumViewPage/constants';

describe('albumReducer', () => {
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
    expect(albumReducer(state, action)).toEqual(expected);
  });

  it.skip('should return next memory after two', () => {
    const action = {
      type: NEXT_MEMORY,
      adjacentInt: 1,
    };
    const state = fromJS({
      albums: {
        gallery: 'demo',
        album: 'sample',
        currentMemory: {
          id: 1,
        },
        demo: {
          sample: {
            memories: [],
          },
        },
      },
    }).get('albums');
    const expected = fromJS({
      demo: {
        sample: {
          memories: [],
        },
      },
    });
    expect(albumReducer(state, action)).toEqual(expected);
  });
});
