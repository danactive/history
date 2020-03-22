/* global fetch */
import { Dropbox } from 'dropbox';
import {
  call, put, select, takeEvery,
} from 'redux-saga/effects';

import normalizeError from '../../utils/error';

import { CHOOSE_MEMORY } from '../App/constants';
import { makeSelectCurrentMemory } from '../App/selectors';
import { makeSelectMemories } from '../AlbumViewPage/selectors';
import { photoLoadError, photoLoadSuccess } from '../App/actions';
import {
  NEXT_MEMORY,
  PREV_MEMORY,
} from '../AlbumViewPage/constants';

const dbx = (process.env.HISTORY_DROPBOX_ACCESS_TOKEN) ? new Dropbox({ accessToken: process.env.HISTORY_DROPBOX_ACCESS_TOKEN, fetch }) : null;


const getYear = (filename = '') => filename.substr(0, 4);


const replaceFileExtWithJpg = (filename = '') => `${filename.substr(0, filename.lastIndexOf('.'))}.jpg`;


export const argsPhotoXmlPath = ({ gallery, filename }) => {
  const year = getYear(filename);
  const jpgFilename = replaceFileExtWithJpg(filename);

  return {
    path: `/public/gallery-${gallery}/media/photos/${year}/${jpgFilename}`,
  };
};


// saga WORKER for CHOOSE_MEMORY
export function* getPhotoPathsOnDropbox({
  currentMemory,
  host,
  gallery,
  album,
}) {
  try {
    const { filename, id } = currentMemory;
    const xmlUrl = yield call([dbx, 'filesGetTemporaryLink'], argsPhotoXmlPath({ gallery, filename }));

    yield put(photoLoadSuccess({
      id,
      photoLink: xmlUrl.link,
      host,
      gallery,
      album,
    }));
  } catch (error) {
    yield put(photoLoadError(normalizeError(error)));
  }
}

export function* getPhotoPathsLocally({
  id,
  currentMemory,
  host,
  gallery,
  album,
}) {
  yield put(photoLoadSuccess({
    id,
    photoLink: currentMemory.thumbLink.replace('thumbs', 'photos'),
    host,
    gallery,
    album,
  }));
}

export function* getCurrentMemoryPhotoPath({ id }) {
  const {
    currentMemory,
    host,
    gallery,
    album,
  } = yield select(makeSelectCurrentMemory());

  const memories = yield select(makeSelectMemories());
  const { photoLink } = memories.find(memory => memory.id === id);

  if (photoLink !== null) {
    return;
  }

  if (host === 'dropbox') {
    yield call(getPhotoPathsOnDropbox, {
      id,
      currentMemory,
      host,
      gallery,
      album,
    });
  } else if (host === 'local') {
    yield call(getPhotoPathsLocally, {
      id,
      currentMemory,
      host,
      gallery,
      album,
    });
  }
}


// ROOT saga manages WATCHER lifecycle
export default function* InfiniteThumbsSagaWatcher() {
  yield takeEvery([CHOOSE_MEMORY, NEXT_MEMORY, PREV_MEMORY], getCurrentMemoryPhotoPath);
}
