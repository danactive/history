import { Dropbox } from 'dropbox';
import { all, call, put, takeEvery } from 'redux-saga/effects';

import { galleriesLoadingSuccess, galleriesLoadingError } from './actions';
import { LOAD_GALLERIES, TOKEN_STORAGE } from './constants';

import request from '../../utils/request';
import { getHostToken } from '../../utils/host';

// eslint-disable-next-line no-console
const logError = (...message) => console.error(...message);

const HISTORY_API_ROOT = getHostToken('local');

// Dropbox API v2 request/response handler
export function* getDropboxGalleries() {
  try {
    const accessToken = getHostToken('dropbox');
    if (!accessToken) {
      const error = new ReferenceError(
        '.env is missing HISTORY_DROPBOX_ACCESS_TOKEN',
      );
      yield put(galleriesLoadingError(error, 'dropbox'));
      return;
    }

    const dbx = new Dropbox({ accessToken, fetch });

    const galleries = yield call([dbx, dbx.filesListFolder], {
      path: '/public',
    });
    yield put(galleriesLoadingSuccess({ dropbox: galleries }));
  } catch (error) {
    logError('getDropboxGalleries', error);
    yield put(galleriesLoadingError(error, 'dropbox'));
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
    yield put(galleriesLoadingError(error, 'local'));
  }
}

function* getGalleries() {
  yield all([call(getLocalFolders), call(getDropboxGalleries)]);
}

// ROOT saga manages WATCHER lifecycle
export default function* HomePageSagaWatcher() {
  yield takeEvery([LOAD_GALLERIES, TOKEN_STORAGE], getGalleries);
}
