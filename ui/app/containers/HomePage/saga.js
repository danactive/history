import Dropbox from 'dropbox';
import {
  call,
  put,
  takeLatest,
} from 'redux-saga/effects';

import { galleriesLoaded, galleriesLoadingError } from './actions';
import { LOAD_GALLERIES } from './constants';

// Dropbox API v2 request/response handler
export function* getDropboxGalleries() {
  const accessToken = process.env.HISTORY_DROPBOX_ACCESS_TOKEN;
  const dbx = new Dropbox({ accessToken });

  try {
    const galleries = yield call([dbx, dbx.filesListFolder], { path: '/public' });
    yield put(galleriesLoaded(galleries));
  } catch (error) {
    yield put(galleriesLoadingError(error));
  }
}

// ROOT saga manages WATCHER lifecycle
export default function* HomePageSagaWatcher() {
  yield takeLatest(LOAD_GALLERIES, getDropboxGalleries);
}
