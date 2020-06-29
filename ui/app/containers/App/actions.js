import {
  CHOOSE_MEMORY,
  LOAD_PHOTO_ERROR,
  LOAD_PHOTO_SUCCESS,
} from './constants';

export function chooseMemory({ id, index }) {
  return {
    type: CHOOSE_MEMORY,
    id,
    index,
  };
}

export function photoLoadSuccess({
  host,
  gallery,
  setCurrentMemory,
  album,
  id,
  photoLink,
}) {
  return {
    type: LOAD_PHOTO_SUCCESS,
    id,
    photoLink,
    setCurrentMemory,
    host,
    gallery,
    album,
  };
}

export function photoLoadError(error, filename) {
  return {
    type: LOAD_PHOTO_ERROR,
    filename,
    error,
  };
}
