import {
  CHOOSE_MEMORY,
  LOAD_PHOTO_ERROR,
  LOAD_PHOTO_SUCCESS,
} from './constants';

export function chooseMemory(id) {
  console.log('action chooseMemory; id ', id);
  return {
    type: CHOOSE_MEMORY,
    id,
  };
}

export function photoLoadSuccess({
  gallery, album, id, photoLink,
}) {
  console.log('action photoLoadSuccess');
  return {
    type: LOAD_PHOTO_SUCCESS,
    gallery,
    album,
    id,
    photoLink,
  };
}

export function photoLoadError(error) {
  return {
    type: LOAD_PHOTO_ERROR,
    error,
  };
}
