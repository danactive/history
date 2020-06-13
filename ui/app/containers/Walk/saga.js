import {
  call,
  put,
  takeLatest,
} from 'redux-saga/effects';

import actions from './actions';
import { apiPort as port } from '../../../../config.json';
import { LIST_DIRECTORY_REQUEST } from './constants';
import request, { querystring } from '../../utils/request';

function getBaseUrl(path) {
  const baseUrl = `http://localhost:${port}/admin/walk-path`;

  if (path) {
    return querystring(baseUrl, { path });
  }

  return baseUrl;
}

// File system directory request/response handler
export function* requestDirectoryListing({ path }) {
  try {
    const url = getBaseUrl(path);
    const listing = yield call(request, url);
    yield put(actions.listingSuccess(listing));
  } catch (error) {
    yield put(actions.listingFailure(error));
  }
}

// ROOT saga manages WATCHER lifecycle
export default function* WalkSagaWatcher() {
  yield takeLatest(LIST_DIRECTORY_REQUEST, requestDirectoryListing);
}
