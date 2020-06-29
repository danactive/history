import {
  LOAD_VIDEO_ERROR,
  LOAD_VIDEO_SUCCESS,
  PRELOAD_PHOTO,
  SKIP_PRELOAD_PHOTO,
} from './constants';

export function preloadPhoto(count) {
  return {
    type: PRELOAD_PHOTO,
    count,
  };
}

export function skipPreloadPhoto() {
  return {
    type: SKIP_PRELOAD_PHOTO,
  };
}

export function loadVideoSuccess({
  host,
  gallery,
  setCurrentMemory,
  album,
  id,
  videoLink,
}) {
  return {
    type: LOAD_VIDEO_SUCCESS,
    id,
    videoLink,
    setCurrentMemory,
    host,
    gallery,
    album,
  };
}

export function videoLoadError(error, filename) {
  return {
    type: LOAD_VIDEO_ERROR,
    filename,
    error,
  };
}
