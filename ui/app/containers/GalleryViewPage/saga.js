import { Dropbox } from 'dropbox';
import { call, put, takeLatest } from 'redux-saga/effects';

import { getHostPath, getHostToken } from '../../utils/host';
import request from '../../utils/request';

import { LOAD_GALLERY } from './constants';
import { galleryLoaded, galleryLoadingError } from './actions';

const HISTORY_API_ROOT = getHostPath('local');

// Dropbox API v2 request/response handler
export function* getGalleryFileOnDropbox({ host, gallery }) {
  const dbx = new Dropbox({
    accessToken: getHostToken('dropbox'),
    fetch,
  });

  try {
    const galleryFileUrl = yield call([dbx, dbx.filesGetTemporaryLink], {
      path: `/public/gallery-${gallery}/xml/gallery.xml`,
    });
    const galleryXml = yield call(request, galleryFileUrl.link);

    yield put(galleryLoaded({ host, gallery, galleryXml }));
  } catch (error) {
    yield put(galleryLoadingError(error));
  }
}

export function* getGalleryFileLocally({ host, gallery }) {
  try {
    const galleryXml = yield call(
      request,
      `${HISTORY_API_ROOT}/static/gallery-${gallery}/xml/gallery.xml`,
    );

    yield put(galleryLoaded({ host, gallery, galleryXml }));
  } catch (error) {
    yield put(galleryLoadingError(error));
  }
}

function* getGalleryFile({ gallery, host }) {
  if (host === 'dropbox') {
    yield call(getGalleryFileOnDropbox, { host, gallery });
  } else if (host === 'local') {
    yield call(getGalleryFileLocally, { host, gallery });
  }
}

// ROOT saga manages WATCHER lifecycle
export default function* GalleryViewPageSagaWatcher() {
  yield takeLatest(LOAD_GALLERY, getGalleryFile);
}
