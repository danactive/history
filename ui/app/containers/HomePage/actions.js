import {
  LOAD_GALLERIES,
  LOAD_GALLERIES_SUCCESS,
  LOAD_GALLERIES_ERROR,
  STORE_HOST_TOKENS,
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

export function storeToken(name, value) {
  return {
    type: STORE_HOST_TOKENS,
    name,
    value,
  };
}
