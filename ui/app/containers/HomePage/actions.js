import {
  LOAD_GALLERIES,
  LOAD_GALLERIES_SUCCESS,
  LOAD_GALLERIES_ERROR,
} from './constants';

export function loadGalleries() {
  return {
    type: LOAD_GALLERIES,
  };
}

export function galleriesLoadingSuccess(galleries) {
  return {
    galleries,
    type: LOAD_GALLERIES_SUCCESS,
  };
}

export function galleriesLoadingError(error) {
  return {
    error,
    type: LOAD_GALLERIES_ERROR,
  };
}
