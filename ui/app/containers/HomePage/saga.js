import { Dropbox } from 'dropbox';
import { all, call, put, takeEvery } from 'redux-saga/effects';

import { galleriesLoadingSuccess, galleriesLoadingError } from './actions';
import { LOAD_GALLERIES, TOKEN_STORAGE } from './constants';

import request from '../../utils/request';
import { getHostToken } from '../../utils/host';

// eslint-disable-next-line no-console
const logError = (...message) => console.error(...message);

const CDN_HOST = getHostToken('cdn');

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
      path: '/galleries',
    });
    yield put(galleriesLoadingSuccess({ dropbox: galleries }));
  } catch (error) {
    logError('getDropboxGalleries', error);
    yield put(galleriesLoadingError(error, 'dropbox'));
  }
}

function* getCdnFolders() {
  try {
    const { galleries } = yield call(request, `${CDN_HOST}/galleryList`);
    yield put(
      galleriesLoadingSuccess({
        cdn: galleries.map(name => ({ name, id: `cdn-${name}` })),
      }),
    );
  } catch (error) {
    logError('getCdnFolders', error);
    yield put(galleriesLoadingError(error, 'cdn'));
  }
}

function* getGalleries() {
  yield all([call(getCdnFolders), call(getDropboxGalleries)]);
}

// ROOT saga manages WATCHER lifecycle
export default function* HomePageSagaWatcher() {
  yield takeEvery([LOAD_GALLERIES, TOKEN_STORAGE], getGalleries);
}
