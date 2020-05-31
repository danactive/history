import {
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
