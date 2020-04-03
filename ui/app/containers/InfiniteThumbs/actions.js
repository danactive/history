import PRELOAD_PHOTO from './constants';

export default function preloadPhoto(adjacentInt) {
  return {
    type: PRELOAD_PHOTO,
    adjacentInt,
  };
}
