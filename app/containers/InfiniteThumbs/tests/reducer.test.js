import { fromJS } from 'immutable';

import albumReducer from '../reducer';

describe('albumReducer', () => {
  let state;

  beforeEach(() => {
    state = fromJS({
      demo: {
        sample: {
          memories: [],
        },
      },
    });
  });

  it('should return the initial state', () => {
    const expected = state;
    expect(albumReducer(undefined, {})).toEqual(expected);
  });
});
