import { call, put, takeLatest } from 'redux-saga/effects';

import actions from './actions';
import { apiPort as port } from '../../../../config.json';
import { LIST_DIRECTORY_REQUEST, RESIZE_IMAGES_REQUEST } from './constants';
import request, { querystring } from '../../utils/request';

function getWalkUrl(path) {
  const baseUrl = `http://localhost:${port}/admin/walk-path`;

  if (path) {
    return querystring(baseUrl, { path });
  }

  return baseUrl;
}

// File system directory request/response handler
export function* requestDirectoryListing({ path }) {
  try {
    const url = getWalkUrl(path);
    const listing = yield call(request, url);
    yield put(actions.listingSuccess(listing));
  } catch (error) {
    yield put(actions.listingFailure(error));
  }
}

// Resize one image per request/response handler
export function* requestResizeImages({ images }) {
  try {
    const url = `http://localhost:${port}/admin/resize`;
    const postBody = {
      source_path: `/todo/Kelowna/Test/${images[0]}`,
    };
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(postBody),
    };
    yield call(request, url, options);
    yield put(actions.resizeSuccess());
  } catch (error) {
    yield put(actions.resizeFailure(error));
  }
}

// ROOT saga manages WATCHER lifecycle
export default function* WalkSagaWatcher() {
  yield takeLatest(LIST_DIRECTORY_REQUEST, requestDirectoryListing);
  yield takeLatest(RESIZE_IMAGES_REQUEST, requestResizeImages);
}
