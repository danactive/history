import { Dropbox } from 'dropbox';
import { all, call, put, takeLatest } from 'redux-saga/effects';

import request from '../../utils/request';
import { galleriesLoadingSuccess, galleriesLoadingError } from './actions';
import { LOAD_GALLERIES } from './constants';
import { apiPort as port } from '../../../../config.json';

// eslint-disable-next-line no-console
const logError = (...message) => console.error(...message);

// Dropbox API v2 request/response handler
export function* getDropboxGalleries() {
  try {
    const accessToken = process.env.HISTORY_DROPBOX_ACCESS_TOKEN;

    if (!accessToken) {
      const error = new ReferenceError(
        '.env is missing HISTORY_DROPBOX_ACCESS_TOKEN',
      );
      logError(error);
      yield put(galleriesLoadingError(error));
      return;
    }

    const dbx = new Dropbox({ accessToken, fetch });

    const galleries = yield call([dbx, dbx.filesListFolder], {
      path: '/public',
    });
    yield put(galleriesLoadingSuccess({ dropbox: galleries }));
  } catch (error) {
    logError('getDropboxGalleries', error);
    yield put(galleriesLoadingError(error));
  }
}

function* getLocalFolders() {
  try {
    const { galleries } = yield call(
      request,
      `http://localhost:${port}/gallery/list`,
    );
    yield put(
      galleriesLoadingSuccess({
        local: galleries.map(name => ({ name, id: `local-${name}` })),
      }),
    );
  } catch (error) {
    logError('getLocalFolders', error);
    yield put(galleriesLoadingError(error));
  }
}

function* getGalleries() {
  yield all([call(getLocalFolders), call(getDropboxGalleries)]);
}

// ROOT saga manages WATCHER lifecycle
export default function* HomePageSagaWatcher() {
  yield takeLatest(LOAD_GALLERIES, getGalleries);
}
