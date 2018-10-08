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

export function galleriesLoaded(galleries) {
  return {
    type: LOAD_GALLERIES_SUCCESS,
    galleries,
  };
}

export function galleriesLoadingError(error) {
  return {
    type: LOAD_GALLERIES_ERROR,
    error,
  };
}
