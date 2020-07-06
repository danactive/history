import {
  LOAD_GALLERIES,
  LOAD_GALLERIES_SUCCESS,
  LOAD_GALLERIES_ERROR,
  TOKEN_STORAGE,
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

export function galleriesLoadingError(error, host) {
  return {
    type: LOAD_GALLERIES_ERROR,
    error,
    host,
  };
}

export function tokenStorage(name, value, isAdded) {
  return {
    type: TOKEN_STORAGE,
    name,
    value,
    isAdded,
  };
}
