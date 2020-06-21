import { Dropbox } from 'dropbox';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import normalizeError from '../../utils/error';

import { CHOOSE_MEMORY } from '../App/constants';
import { makeSelectCurrentMemory } from '../App/selectors';
import { makeSelectMemories } from '../AlbumViewPage/selectors';
import { chooseMemory, photoLoadError, photoLoadSuccess } from '../App/actions';
import { NEXT_MEMORY, PREV_MEMORY } from '../AlbumViewPage/constants';
import { PRELOAD_PHOTO } from './constants';
import { preloadPhoto, skipPreloadPhoto } from './actions';
const dbxOptions = {
  accessToken: process.env.HISTORY_DROPBOX_ACCESS_TOKEN,
  fetch,
};
const dbx = process.env.HISTORY_DROPBOX_ACCESS_TOKEN
  ? new Dropbox(dbxOptions)
  : null;

const getYear = (filename = '') => filename.substr(0, 4);

const replaceFileExtWithJpg = (filename = '') =>
  `${filename.substr(0, filename.lastIndexOf('.'))}.jpg`;

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
    const xmlUrl = yield call(
      [dbx, 'filesGetTemporaryLink'],
      argsPhotoXmlPath({ gallery, filename }),
    );

    yield put(
      photoLoadSuccess({
        id,
        photoLink: xmlUrl.link,
        setCurrentMemory,
        host,
        gallery,
        album,
      }),
    );
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
  yield put(
    photoLoadSuccess({
      id,
      photoLink: memory.thumbLink.replace('thumbs', 'photos'),
      setCurrentMemory,
      host,
      gallery,
      album,
    }),
  );
}

export const determineAdjacentInCarousel = ({
  adjacentInt = null,
  currentMemory = null,
  memories,
} = {}) => {
  let adjacentMemoryIndex;

  if (!adjacentInt || !currentMemory) {
    adjacentMemoryIndex = 0;
  } else {
    const currentMemoryId = currentMemory.id;
    const currentMemoryIndex = memories.findIndex(
      item => item.id === currentMemoryId,
    );
    adjacentMemoryIndex = currentMemoryIndex + adjacentInt;

    const carouselEnd = adjacentMemoryIndex >= memories.length;
    if (carouselEnd) adjacentMemoryIndex -= memories.length;

    const carouselBegin = adjacentMemoryIndex < 0;
    if (carouselBegin)
      adjacentMemoryIndex = memories.length + adjacentMemoryIndex;
  }

  return {
    id: memories[adjacentMemoryIndex].id,
    index: adjacentMemoryIndex,
  };
};

// saga WORKER for CHOOSE_MEMORY
export function* getMemoryPhotoPath({ id, index, setCurrentMemory = true }) {
  const { currentMemory, host, gallery, album } = yield select(
    makeSelectCurrentMemory(),
  );

  const memories = yield select(makeSelectMemories());
  const memory = index ? memories[index] : memories.find(m => m.id === id);

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

  const adjacent = determineAdjacentInCarousel({
    adjacentInt,
    currentMemory,
    memories,
  });

  yield put(chooseMemory(adjacent));
}

// saga WORKER for PRELOAD_PHOTO
export function* preloadAdjacentMemoryId({ count = 1 } = {}) {
  const memories = yield select(makeSelectMemories());
  const memoriesAwaitingPhoto = memories.filter(
    memory => memory.photoLink === null,
  );

  if (memoriesAwaitingPhoto.length === 0) {
    yield put(skipPreloadPhoto());
    return;
  }

  const { currentMemory } = yield select(makeSelectCurrentMemory());

  if (currentMemory) {
    const currentMemoryIndex = memories.findIndex(
      memory => memory.id === currentMemory.id,
    );
    const findMemory = memoriesAwaitingPhoto.find(
      m => m.id === memories[currentMemoryIndex + 1].id,
    );

    if (!findMemory) {
      yield put(skipPreloadPhoto());
      return;
    }

    yield call(getMemoryPhotoPath, {
      id: findMemory.id,
      index: currentMemoryIndex + 1,
      setCurrentMemory: false,
    });
    return;
  }

  for (let i = 0; i < count; i += 1) {
    const findId = memoriesAwaitingPhoto[i].id;
    const memoryIndex = memories.findIndex(memory => memory.id === findId);
    yield call(getMemoryPhotoPath, {
      id: findId,
      index: memoryIndex,
      setCurrentMemory: false,
    });
  }
}

// ROOT saga manages WATCHER lifecycle
export default function* InfiniteThumbsSagaWatcher() {
  yield takeEvery(CHOOSE_MEMORY, getMemoryPhotoPath);
  yield takeEvery([NEXT_MEMORY, PREV_MEMORY], calculateAdjacentMemoryId);
  yield takeEvery(PRELOAD_PHOTO, preloadAdjacentMemoryId);
}
