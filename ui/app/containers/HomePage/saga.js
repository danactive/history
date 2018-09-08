import Dropbox from 'dropbox';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { LOAD_REPOS } from 'containers/App/constants';
import { reposLoaded, repoLoadingError } from 'containers/App/actions';

import request from 'utils/request';
import { makeSelectUsername } from 'containers/HomePage/selectors';

import { LOAD_GALLERIES } from './constants';
import { galleriesLoaded, galleriesLoadingError } from './actions';
/**
 * Github repos request/response handler
 */
export function* getRepos() {
  // Select username from store
  const username = yield select(makeSelectUsername());
  const requestURL = `https://api.github.com/users/${username}/repos?type=all&sort=updated`;

  try {
    // Call our request helper (see 'utils/request')
    const repos = yield call(request, requestURL);
    yield put(reposLoaded(repos, username));
  } catch (err) {
    yield put(repoLoadingError(err));
  }
}

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
  yield takeLatest(LOAD_REPOS, getRepos);
  yield takeLatest(LOAD_GALLERIES, getDropboxGalleries);
}
