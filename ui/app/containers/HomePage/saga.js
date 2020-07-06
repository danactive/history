import { Dropbox } from 'dropbox';
import { all, call, put, takeEvery, takeLatest } from 'redux-saga/effects';

import { galleriesLoadingSuccess, galleriesLoadingError } from './actions';
import { LOAD_GALLERIES, STORE_HOST_TOKENS } from './constants';

import request from '../../utils/request';
import { getHostToken, getHostPath } from '../../utils/host';

// eslint-disable-next-line no-console
const logError = (...message) => console.error(...message);

const HISTORY_API_ROOT = getHostPath('local');

// Dropbox API v2 request/response handler
export function* getDropboxGalleries() {
  try {
    const accessToken = getHostToken('dropbox');
    if (!accessToken) {
      const error = new ReferenceError(
        '.env is missing HISTORY_DROPBOX_ACCESS_TOKEN',
      );
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
      `${HISTORY_API_ROOT}/gallery/list`,
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

function* backFillGalleries({ name }) {
  if (name === 'dropbox') {
    yield call(getDropboxGalleries);
  }

  if (name === 'local') {
    yield call(getLocalFolders);
  }
}

// ROOT saga manages WATCHER lifecycle
export default function* HomePageSagaWatcher() {
  yield takeLatest(LOAD_GALLERIES, getGalleries);
  yield takeEvery(STORE_HOST_TOKENS, backFillGalleries);
}
