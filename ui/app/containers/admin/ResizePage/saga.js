import { call, put, takeLatest } from 'redux-saga/effects';
import 'whatwg-fetch';

import request from '../../../utils/request';
import { getHostToken } from '../../../utils/host';

import { RESIZE_IMAGE } from './constants';
import { resizeImageFailed, resizeImageSuccess } from './actions';

const HISTORY_API_ROOT = getHostToken('local');

export function* callResizeApi({ filename }) {
  try {
    const requestArgs = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_path: filename,
      }),
    };
    const response = yield call(
      request,
      `${HISTORY_API_ROOT}/admin/resize`,
      requestArgs,
    );

    yield put(resizeImageSuccess(response));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('error', error);
    yield put(resizeImageFailed(error));
  }
}

// ROOT saga manages WATCHER lifecycle
export default function* ResizePageSagaWatcher() {
  yield takeLatest(RESIZE_IMAGE, callResizeApi);
}
