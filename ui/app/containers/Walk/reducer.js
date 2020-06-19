import produce from 'immer';
import { LIST_DIRECTORY_REQUEST, LIST_DIRECTORY_SUCCESS } from './constants';

export const initialState = {
  listing: {
    files: [],
  },
};

/* eslint-disable default-case, no-param-reassign */
const walkReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case LIST_DIRECTORY_SUCCESS:
        draft.listing.files = action.files;
        break;

      case LIST_DIRECTORY_REQUEST:
        draft.listing.path = action.path;
        break;
    }
  });

export default walkReducer;
