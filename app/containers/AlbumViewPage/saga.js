import Dropbox from 'dropbox';
import { call, put, takeLatest } from 'redux-saga/effects';

import request from 'utils/request';

import { LOAD_ALBUM } from './constants';
import { albumLoaded, albumLoadingError } from './actions';

// Dropbox API v2 request/response handler
export function* getDropboxAlbumFile({ albumName }) {
  const dbx = new Dropbox({ accessToken: process.env.HISTORY_DROPBOX_ACCESS_TOKEN });

  try {
    const galleryName = 'dan';
    const albumFileUrl = yield call([dbx, dbx.filesGetTemporaryLink], { path: `/public/gallery-${galleryName}/xml/album_${albumName}.xml` });
    const albumFile = yield call(request, albumFileUrl.link);

    yield put(albumLoaded(albumFile));
  } catch (error) {
    yield put(albumLoadingError(error));
  }
}

// ROOT saga manages WATCHER lifecycle
export default function* AlbumViewPageSagaWatcher() {
  yield takeLatest(LOAD_ALBUM, getDropboxAlbumFile);
}
