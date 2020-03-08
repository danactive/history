/* global fetch */
import { Dropbox } from 'dropbox';
import {
  all,
  call,
  put,
  takeLatest,
} from 'redux-saga/effects';

import request from '../../utils/request';
import { galleriesLoaded, galleriesLoadingError } from './actions';
import { LOAD_GALLERIES } from './constants';

// Dropbox API v2 request/response handler
export function* getDropboxGalleries() {
  try {
    const accessToken = process.env.HISTORY_DROPBOX_ACCESS_TOKEN;

    if (!accessToken) {
      return;
    }

    const dbx = new Dropbox({ accessToken, fetch });

    const galleries = yield call([dbx, dbx.filesListFolder], { path: '/public' });
    yield put(galleriesLoaded({ dropbox: galleries }));
  } catch (error) {
    yield put(galleriesLoadingError(error));
  }
}

function* getLocalFolders() {
  try {
    const { galleries } = yield call(request, 'http://localhost:8000/gallery/list');
    yield put(galleriesLoaded({ local: galleries.map(name => ({ name, id: `local-${name}` })) }));
  } catch (error) {
    yield put(galleriesLoadingError(error));
  }
}

function* getGalleries() {
  yield all([
    call(getLocalFolders),
    call(getDropboxGalleries),
  ]);
}

// ROOT saga manages WATCHER lifecycle
export default function* HomePageSagaWatcher() {
  yield takeLatest(LOAD_GALLERIES, getGalleries);
}
