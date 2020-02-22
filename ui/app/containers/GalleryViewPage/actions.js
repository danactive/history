import {
  LOAD_GALLERY,
  LOAD_GALLERY_SUCCESS,
  LOAD_GALLERY_ERROR,
} from './constants';

export function loadGallery({ host, gallery }) {
  return {
    type: LOAD_GALLERY,
    gallery,
    host,
  };
}

export function galleryLoaded({ host, gallery, galleryXml }) {
  return {
    type: LOAD_GALLERY_SUCCESS,
    host,
    gallery,
    galleryXml,
  };
}

export function galleryLoadingError(error) {
  return {
    type: LOAD_GALLERY_ERROR,
    error,
  };
}
