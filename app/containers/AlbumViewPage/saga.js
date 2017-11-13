import Dropbox from 'dropbox';
import { all, call, put, takeLatest } from 'redux-saga/effects';

import { normalizeError } from 'utils/error';
import request from 'utils/request';

import { LOAD_ALBUM, LOAD_ALBUM_SUCCESS } from './constants';
import {
  albumLoaded,
  albumLoadingError,
  thumbLinksLoaded,
  thumbLinksLoadingError,
} from './actions';

const dbx = new Dropbox({ accessToken: process.env.HISTORY_DROPBOX_ACCESS_TOKEN });

// Dropbox API v2 request/response handler
export function* getDropboxAlbumFile({ albumName, galleryName }) {
  try {
    const path = `/public/gallery-${galleryName}/xml/album_${albumName}.xml`;
    const albumFileUrl = yield call([dbx, dbx.filesGetTemporaryLink], { path });
    const albumFile = yield call(request, albumFileUrl.link);

    yield put(albumLoaded(albumFile));
  } catch (error) {
    yield put(albumLoadingError(error));
  }
}

export function* getDropboxThumbFilename({ thumbs }) {
  try {
    const galleryName = 'demo';
    const yields = thumbs.map((thumb) => {
      if (thumb.filename.toLowerCase().includes('jpg')) {
        const year = thumb.filename.substr(0, 4);
        const path = `/public/gallery-${galleryName}/media/thumbs/${year}/${thumb.filename}`;
        return call([dbx, dbx.filesGetTemporaryLink], { path }); // eslint-disable-line redux-saga/yield-effects
      }

      return { link: null };
    });
    const dropboxResults = yield all(yields);
    const out = thumbs.map((thumb, index) => ({ ...thumb, link: dropboxResults[index].link }));
    yield put(thumbLinksLoaded(out));
  } catch (error) {
    yield put(thumbLinksLoadingError(normalizeError(error)));
  }
}

// ROOT saga manages WATCHER lifecycle
export default function* AlbumViewPageSagaWatcher() {
  yield takeLatest(LOAD_ALBUM, getDropboxAlbumFile);
  yield takeLatest(LOAD_ALBUM_SUCCESS, getDropboxThumbFilename);
}
