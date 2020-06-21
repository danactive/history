import { Dropbox } from 'dropbox';
import { call, put, takeLatest } from 'redux-saga/effects';

import request from '../../utils/request';

import { LOAD_GALLERY } from './constants';
import { galleryLoaded, galleryLoadingError } from './actions';
import { apiPort as port } from '../../../../config.json';

// Dropbox API v2 request/response handler
export function* getGalleryFileOnDropbox({ host, gallery }) {
  const dbx = new Dropbox({
    accessToken: process.env.HISTORY_DROPBOX_ACCESS_TOKEN,
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
      `http://localhost:${port}/static/gallery-${gallery}/xml/gallery.xml`,
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
