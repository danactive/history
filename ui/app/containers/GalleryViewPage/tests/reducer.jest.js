import { fromJS } from 'immutable';
import galleryViewPageReducer from '../reducer';

describe('galleryViewPageReducer', () => {
  it('returns the initial state', () => {
    expect(galleryViewPageReducer(undefined, {})).toEqual(fromJS({
      galleryError: false,
      galleryLoading: false,
    }));
  });
});
