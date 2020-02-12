import {
  LIST_DIRECTORY_REQUEST,
  LIST_DIRECTORY_SUCCESS,
  LIST_DIRECTORY_FAILURE,
} from './constants';

function getFilesByPath(path) {
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
  getFilesByPath,
  listingSuccess,
  listingFailure,
};
