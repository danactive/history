import {
  LIST_DIRECTORY_REQUEST,
  LIST_DIRECTORY_SUCCESS,
  LIST_DIRECTORY_FAILURE,
} from './constants';

function listDirectory(path) {
  return {
    type: LIST_DIRECTORY_REQUEST,
    path,
  };
}

function listingSuccess(listing) {
  return {
    type: LIST_DIRECTORY_SUCCESS,
    files: listing.files,
  };
}

function listingFailure(error) {
  return {
    type: LIST_DIRECTORY_FAILURE,
    error,
  };
}

export default {
  listDirectory,
  listingSuccess,
  listingFailure,
};
