/* global fetch */
import { Dropbox } from 'dropbox';
import {
  call, put, select, takeEvery,
} from 'redux-saga/effects';

import normalizeError from '../../utils/error';

import { CHOOSE_MEMORY } from '../App/constants';
import { makeSelectCurrentMemory } from '../App/selectors';
import { makeSelectMemories } from '../AlbumViewPage/selectors';
import { chooseMemory, photoLoadError, photoLoadSuccess } from '../App/actions';
import { NEXT_MEMORY, PREV_MEMORY } from '../AlbumViewPage/constants';
import PRELOAD_PHOTO from './constants';
import preloadPhoto from './actions';

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


// saga WORKER for CHOOSE_MEMORY for Dropbox gallery
export function* getPhotoPathsOnDropbox({
  memory,
  setCurrentMemory,
  host,
  gallery,
  album,
}) {
  try {
    const { filename, id } = memory;
    const xmlUrl = yield call([dbx, 'filesGetTemporaryLink'], argsPhotoXmlPath({ gallery, filename }));

    yield put(photoLoadSuccess({
      id,
      photoLink: xmlUrl.link,
      setCurrentMemory,
      host,
      gallery,
      album,
    }));
  } catch (error) {
    yield put(photoLoadError(normalizeError(error)));
  }
}

// saga WORKER for CHOOSE_MEMORY for local gallery
export function* getPhotoPathsLocally({
  id,
  memory,
  setCurrentMemory,
  host,
  gallery,
  album,
}) {
  yield put(photoLoadSuccess({
    id,
    photoLink: memory.thumbLink.replace('thumbs', 'photos'),
    setCurrentMemory,
    host,
    gallery,
    album,
  }));
}

export const determineAdjacentInCarousel = ({ adjacentInt = null, currentMemory = null, memories } = {}) => {
  let adjacentMemoryIndex;

  if (!adjacentInt || !currentMemory) {
    adjacentMemoryIndex = 0;
  } else {
    const currentMemoryId = currentMemory.id;
    const currentMemoryIndex = memories.findIndex(item => item.id === currentMemoryId);
    adjacentMemoryIndex = currentMemoryIndex + adjacentInt;

    const carouselEnd = adjacentMemoryIndex >= memories.length;
    if (carouselEnd) adjacentMemoryIndex -= memories.length;

    const carouselBegin = adjacentMemoryIndex < 0;
    if (carouselBegin) adjacentMemoryIndex = memories.length + adjacentMemoryIndex;
  }

  const findIndex = memories[adjacentMemoryIndex].id;

  return findIndex;
};

// saga WORKER for CHOOSE_MEMORY
export function* getMemoryPhotoPath({ id, setCurrentMemory = true }) {
  const {
    currentMemory,
    host,
    gallery,
    album,
  } = yield select(makeSelectCurrentMemory());

  const memories = yield select(makeSelectMemories());
  const memory = memories.find(m => m.id === id);

  if (memory.thumbLink === null) {
    return;
  }

  if (memory.photoLink === null) {
    if (host === 'dropbox') {
      yield call(getPhotoPathsOnDropbox, {
        id,
        memory,
        setCurrentMemory,
        host,
        gallery,
        album,
      });
    } else if (host === 'local') {
      yield call(getPhotoPathsLocally, {
        id,
        memory,
        setCurrentMemory,
        host,
        gallery,
        album,
      });
    }
  } else if (currentMemory) {
    yield put(preloadPhoto(1));
  }
}

// saga WORKER for NEXT_MEMORY, PREV_MEMORY
export function* calculateAdjacentMemoryId({ adjacentInt }) {
  const memories = yield select(makeSelectMemories());
  const { currentMemory } = yield select(makeSelectCurrentMemory());

  const findIndex = determineAdjacentInCarousel({ adjacentInt, currentMemory, memories });

  yield put(chooseMemory(findIndex));
}

// saga WORKER for PRELOAD_PHOTO
export function* preloadAdjacentMemoryId({ adjacentInt }) {
  const memories = yield select(makeSelectMemories());

  if (adjacentInt) {
    const { currentMemory } = yield select(makeSelectCurrentMemory());
    const findIndex = determineAdjacentInCarousel({ adjacentInt, currentMemory, memories });

    const skipPreload = memories.find(m => m.id === findIndex).photoLink;
    if (skipPreload) {
      return;
    }

    yield call(getMemoryPhotoPath, { id: findIndex, setCurrentMemory: false });
    return;
  }

  const findIndex = determineAdjacentInCarousel({ memories });
  yield call(getMemoryPhotoPath, { id: findIndex, setCurrentMemory: false });
}


// ROOT saga manages WATCHER lifecycle
export default function* InfiniteThumbsSagaWatcher() {
  yield takeEvery([CHOOSE_MEMORY], getMemoryPhotoPath);
  yield takeEvery([NEXT_MEMORY, PREV_MEMORY], calculateAdjacentMemoryId);
  yield takeEvery([PRELOAD_PHOTO], preloadAdjacentMemoryId);
}
