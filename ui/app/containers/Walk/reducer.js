import produce from 'immer';
import { LIST_DIRECTORY_SUCCESS } from './constants';

export const initialState = {
  listing: {
    files: [],
  },
};

/* eslint-disable default-case, no-param-reassign */
const walkReducer = (state = initialState, action) => produce(state, (draft) => {
  switch (action.type) {
    case LIST_DIRECTORY_SUCCESS:
      draft.listing = action.listing;
      break;
  }
});

export default walkReducer;
