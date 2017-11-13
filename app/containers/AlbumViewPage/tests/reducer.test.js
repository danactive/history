
import { fromJS } from 'immutable';
import albumViewPageReducer from '../reducer';

describe('albumViewPageReducer', () => {
  it('returns the initial state', () => {
    expect(albumViewPageReducer(undefined, {})).toEqual(fromJS({}));
  });
});
