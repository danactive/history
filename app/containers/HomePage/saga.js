/**
 * Gets the repositories of the user from Github
 */
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

export function* getDropboxGalleries() {
  const dbx = new Dropbox({ accessToken: process.env.HISTORY_DROPBOX_ACCESS_TOKEN });

  try {
    const galleries = yield call([dbx, dbx.filesListFolder], { path: '' });
    yield put(galleriesLoaded(galleries));
  } catch (error) {
    yield put(galleriesLoadingError(error));
  }
}

/**
 * ROOT saga manages WATCHER lifecycle
 */
export default function* HomePageSagaWatcher() {
  // Watches for LOAD_REPOS actions and calls getRepos when one comes in.
  // By using `takeLatest` only the result of the latest API call is applied.
  // It returns task descriptor (just like fork) so we can continue execution
  // It will be cancelled automatically on component unmount
  yield takeLatest(LOAD_REPOS, getRepos);
  yield takeLatest(LOAD_GALLERIES, getDropboxGalleries);
}
