import { Dropbox } from 'dropbox';
import {
  call,
  put,
  takeLatest,
} from 'redux-saga/effects';

import { galleriesLoaded, galleriesLoadingError } from './actions';
import { LOAD_GALLERIES } from './constants';

// Dropbox API v2 request/response handler
export function* getDropboxGalleries() {
  try {
    const accessToken = process.env.FAKE_HISTORY_DROPBOX_ACCESS_TOKEN;

    if (!accessToken) {
      throw new ReferenceError('Dropbox access token is missing');
    }

    const dbx = new Dropbox({ accessToken });

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
