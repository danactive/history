import {
  LIST_DIRECTORY_REQUEST,
  LIST_DIRECTORY_SUCCESS,
  LIST_DIRECTORY_FAILURE,
  RESIZE_IMAGES_REQUEST,
  RESIZE_IMAGES_SUCCESS,
  RESIZE_IMAGES_FAILURE,
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

function resizeImages(images) {
  return {
    type: RESIZE_IMAGES_REQUEST,
    images,
  };
}

function resizeSuccess() {
  return {
    type: RESIZE_IMAGES_SUCCESS,
  };
}

function resizeFailure(error) {
  return {
    type: RESIZE_IMAGES_FAILURE,
    error,
  };
}

export default {
  listDirectory,
  listingSuccess,
  listingFailure,
  resizeImages,
  resizeSuccess,
  resizeFailure,
};
