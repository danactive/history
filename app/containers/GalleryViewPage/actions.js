/*
 *
 * GalleryViewPage actions
 *
 */

import {
  LOAD_GALLERY,
  LOAD_GALLERY_SUCCESS,
  LOAD_GALLERY_ERROR,
} from './constants';

export function loadGallery(galleryName) {
  return {
    type: LOAD_GALLERY,
    galleryName,
  };
}

export function galleryLoaded(galleryXml) {
  return {
    type: LOAD_GALLERY_SUCCESS,
    galleryXml,
  };
}

export function galleryLoadingError(error) {
  return {
    type: LOAD_GALLERY_ERROR,
    error,
  };
}

