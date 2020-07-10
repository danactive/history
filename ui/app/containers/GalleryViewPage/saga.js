import { Dropbox } from 'dropbox';
import { call, put, takeLatest } from 'redux-saga/effects';

import { getHostToken } from '../../utils/host';
import request from '../../utils/request';

import { LOAD_GALLERY } from './constants';
import { galleryLoaded, galleryLoadingError } from './actions';

const CDN_HOST = getHostToken('cdn');

// Dropbox API v2 request/response handler
export function* getGalleryFileOnDropbox({ host, gallery }) {
  const dbx = new Dropbox({
    accessToken: getHostToken('dropbox'),
    fetch,
  });

  try {
    const galleryFileUrl = yield call([dbx, dbx.filesGetTemporaryLink], {
      path: `/galleries/${gallery}/gallery.xml`,
    });
    const galleryXml = yield call(request, galleryFileUrl.link);

    yield put(galleryLoaded({ host, gallery, galleryXml }));
  } catch (error) {
    yield put(galleryLoadingError(error));
  }
}

export function* getGalleryFileOnCdn({ host, gallery }) {
  try {
    const galleryXml = yield call(
      request,
      `${CDN_HOST}/galleries/${gallery}/gallery.xml`,
    );

    yield put(galleryLoaded({ host, gallery, galleryXml }));
  } catch (error) {
    yield put(galleryLoadingError(error));
  }
}

function* getGalleryFile({ gallery, host }) {
  if (host === 'dropbox') {
    yield call(getGalleryFileOnDropbox, { host, gallery });
  } else if (host === 'cdn') {
    yield call(getGalleryFileOnCdn, { host, gallery });
  }
}

// ROOT saga manages WATCHER lifecycle
export default function* GalleryViewPageSagaWatcher() {
  yield takeLatest(LOAD_GALLERY, getGalleryFile);
}
