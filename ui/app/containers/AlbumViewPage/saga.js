import { Dropbox } from 'dropbox';
import { all, call, put, select, takeLatest } from 'redux-saga/effects';

import request from '../../utils/request';
import normalizeError from '../../utils/error';
import { getHostToken } from '../../utils/host';

import {
  LOAD_ALBUM,
  LOAD_NEXT_THUMB_PAGE,
  LOAD_ENOUGH_THUMBS,
  SLIDE_TO_MEMORY,
  PAGE_SIZE,
} from './constants';
import { LOAD_PHOTO_SUCCESS } from '../App/constants';
import {
  albumLoadSuccess,
  albumLoadError,
  nextPageSuccess,
  nextPageError,
  thumbsLoaded,
  enoughThumbsLoaded,
} from './actions';
import { selectNextPage } from './selectors';
import { getItemNodes, parseItemNode } from './transformXmlToJson';
import { getPage } from './paging';
import { supportedFileTypes } from '../../../../config.json';
import { chooseMemory } from '../App/actions';
import { preloadPhoto } from '../InfiniteThumbs/actions';
import { preloadAdjacentMemoryId } from '../InfiniteThumbs/saga';

const HISTORY_API_ROOT = getHostToken('local');

const dbx = new Dropbox({
  accessToken: getHostToken('dropbox'),
  fetch,
});

export const argsAlbumXmlPath = ({ gallery, album }) => ({
  path: `/public/gallery-${gallery}/xml/album_${album}.xml`,
});

const getYear = (filename = '') => filename.substr(0, 4);
const getFileExt = filename => filename.match(/\.[0-9a-z]+$/i)[0].substring(1);
export const videoExtToJpg = filename => {
  if (supportedFileTypes.video.includes(getFileExt(filename))) {
    return filename.replace(getFileExt(filename), 'jpg');
  }

  return filename;
};

const replaceFileExtWithJpg = (filename = '') =>
  `${filename.substr(0, filename.lastIndexOf('.'))}.jpg`;

export const argsThumbImgPath = ({ gallery, filename }) => {
  const year = getYear(filename);
  const jpgFilename = replaceFileExtWithJpg(filename);

  return {
    path: `/public/gallery-${gallery}/media/thumbs/${year}/${jpgFilename}`,
  };
};

export function thumbFilenameCallsDropbox({ gallery, thumbs }) {
  const queueSagaCalls = thumb =>
    call(
      [dbx, 'filesGetTemporaryLink'],
      argsThumbImgPath({ gallery, filename: thumb.filename }),
    );
  return thumbs.map(queueSagaCalls);
}

// saga WORKER for LOAD_ALBUM
export function* getAlbumFileOnDropbox({ host, gallery, album }) {
  try {
    const xmlUrl = yield call(
      [dbx, 'filesGetTemporaryLink'],
      argsAlbumXmlPath({ gallery, album }),
    );
    const xmlFile = yield call(request, xmlUrl.link);
    const memories = getItemNodes(xmlFile).map(parseItemNode);

    yield put(
      albumLoadSuccess({
        memories,
        host,
        gallery,
        album,
      }),
    );
  } catch (error) {
    yield put(albumLoadError(normalizeError(error)));
  }
}

export function* getAlbumFileLocally({ host, gallery, album }) {
  try {
    const xmlFile = yield call(
      request,
      `${HISTORY_API_ROOT}/view/album/${gallery}/${album}`,
    );
    const memories = getItemNodes(xmlFile).map(parseItemNode);
    yield put(
      albumLoadSuccess({
        memories,
        host,
        gallery,
        album,
      }),
    );
  } catch (error) {
    yield put(albumLoadError(normalizeError(error)));
  }
}

export function* getAlbumFile({ host, gallery, album }) {
  if (host === 'dropbox') {
    yield call(getAlbumFileOnDropbox, { host, gallery, album });
  } else if (host === 'local') {
    yield call(getAlbumFileLocally, { host, gallery, album });
  }
}

// saga WORKER for LOAD_NEXT_THUMB_PAGE
export function* getThumbPathsOnDropbox({
  memories,
  page: prevPage,
  host,
  gallery,
  album,
}) {
  try {
    if (!memories || memories.length === 0) {
      throw new Error(
        `Empty or malformed album; memories=(${JSON.stringify(memories)})`,
      );
    }

    const page = prevPage + 1;
    const pagedMemories = getPage({
      page,
      pageSize: PAGE_SIZE,
      list: memories,
    });

    const hasMore = PAGE_SIZE * page < memories.length;

    const dropboxResults = yield all(
      thumbFilenameCallsDropbox({ gallery, thumbs: pagedMemories }),
    );
    const linkedMemories = pagedMemories.map((memory, index) => ({
      ...memory,
      thumbLink: dropboxResults[index].link,
    }));

    if (!hasMore) {
      // all pages processed so thumbs all have Dropbox links
      yield put(
        thumbsLoaded({
          newMemories: linkedMemories,
          page,
          host,
          gallery,
          album,
        }),
      );

      yield put(enoughThumbsLoaded());
      return;
    }

    yield put(
      nextPageSuccess({
        newMemories: linkedMemories,
        hasMore,
        page,
        host,
        gallery,
        album,
      }),
    );

    if (page === 1) {
      yield put(enoughThumbsLoaded());
    }
  } catch (error) {
    yield put(nextPageError(normalizeError(error)));
  }
}

export function* getThumbPathsLocally({
  memories: missingPathMemories,
  host,
  gallery,
  album,
}) {
  try {
    if (!missingPathMemories || missingPathMemories.length === 0) {
      throw new Error(
        `Empty or malformed album; missingPathMemories=(${JSON.stringify(
          missingPathMemories,
        )})`,
      );
    }

    const newMemories = missingPathMemories.map(memory => {
      const jpgFile = videoExtToJpg(memory.filename);
      const year = getYear(memory.filename);

      return {
        ...memory,
        thumbLink: `${HISTORY_API_ROOT}/static/gallery-${gallery}/media/thumbs/${year}/${jpgFile}`,
      };
    });

    yield put(
      nextPageSuccess({
        newMemories,
        page: 1,
        hasMore: false,
        host,
        gallery,
        album,
      }),
    );

    yield put(enoughThumbsLoaded());
  } catch (error) {
    yield put(albumLoadError(normalizeError(error)));
  }
}

export function* getThumbPaths() {
  const args = yield select(selectNextPage);

  if (args.host === 'dropbox') {
    yield call(getThumbPathsOnDropbox, args);
  } else if (args.host === 'local') {
    yield call(getThumbPathsLocally, args);
  }
}

export function* dispatchChooseMemory({ index }) {
  const { memories } = yield select(selectNextPage);

  yield put(chooseMemory({ id: memories[index].id, index }));
}

export function* preloadPhotos() {
  yield put(preloadPhoto(4));
}

export function* ensureNextPhotoLoaded({ setCurrentMemory }) {
  if (setCurrentMemory) {
    yield call(preloadAdjacentMemoryId);
  }
}

// ROOT saga manages WATCHER lifecycle
export default function* AlbumViewPageSagaWatcher() {
  yield takeLatest(SLIDE_TO_MEMORY, dispatchChooseMemory);
  yield takeLatest(LOAD_ALBUM, getAlbumFile);
  yield takeLatest(LOAD_NEXT_THUMB_PAGE, getThumbPaths);
  yield takeLatest(LOAD_ENOUGH_THUMBS, preloadPhotos);
  yield takeLatest(LOAD_PHOTO_SUCCESS, ensureNextPhotoLoaded);
}
