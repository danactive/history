import {
  call,
  put,
  takeLatest,
} from 'redux-saga/effects';

import request, { querystring } from '../../utils/request';
import { apiPort as port } from '../../../../config.json';
import actions from './actions';
import { LIST_DIRECTORY_REQUEST } from './constants';

// File system directory request/response handler
export function* requestDirectoryListing({ path }) {
  try {
    const url = querystring(`http://localhost:${port}/admin/walk-path`, { path });
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
