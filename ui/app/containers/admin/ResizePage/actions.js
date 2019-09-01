import {
  RESIZE_IMAGE,
  RESIZE_IMAGE_SUCCESS,
  RESIZE_IMAGE_FAILED,
} from './constants';

export function resizeImage(filename) {
  return {
    type: RESIZE_IMAGE,
    filename,
  };
}

export function resizeImageSuccess() {
  return {
    type: RESIZE_IMAGE_SUCCESS,
  };
}

export function resizeImageFailed(error) {
  return {
    type: RESIZE_IMAGE_FAILED,
    error,
  };
}
