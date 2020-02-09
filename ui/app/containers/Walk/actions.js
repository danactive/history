import {
  LIST_DIRECTORY_REQUEST,
  LIST_DIRECTORY_SUCCESS,
  LIST_DIRECTORY_FAILURE,
} from './constants';

function getFilesByPath() {
  return {
    type: LIST_DIRECTORY_REQUEST,
  };
}

function listingSuccess(listing) {
  return {
    type: LIST_DIRECTORY_SUCCESS,
    listing,
  };
}

function listingFailure(error) {
  return {
    type: LIST_DIRECTORY_FAILURE,
    error,
  };
}

export default {
  getFilesByPath,
  listingSuccess,
  listingFailure,
};
