/* global window */
import { Dropbox } from 'dropbox';
import {
  all, call, put, select, takeEvery,
} from 'redux-saga/effects';
import 'whatwg-fetch';

import normalizeError from '../../utils/error';

import { CHOOSE_MEMORY } from '../App/constants';
import { selectCurrentMemory } from '../App/selectors';
import { photoLoadError, photoLoadSuccess } from '../App/actions';
import {
  NEXT_MEMORY,
  PREV_MEMORY,
  LOAD_NEXT_THUMB_PAGE,
  PAGE_SIZE,
} from '../AlbumViewPage/constants';
import {
  nextPageSuccess,
  nextPageError,
} from '../AlbumViewPage/actions';
import {
  thumbsLoaded,
} from './actions';
import { selectNextPage } from './selectors';
import { getPage } from './paging';

const accessToken = process.env.HISTORY_DROPBOX_ACCESS_TOKEN || process.env.STORYBOOK_HISTORY_DROPBOX_ACCESS_TOKEN;

const dbx = new Dropbox({
  accessToken,
  fetch: window.fetch,
});

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
export function* getPhotoPathsOnDropbox() {
  try {
    const { gallery, album, currentMemory } = yield select(selectCurrentMemory);
    const { filename, id } = currentMemory;
    const xmlUrl = yield call([dbx, 'filesGetTemporaryLink'], argsPhotoXmlPath({ gallery, filename }));

    yield put(photoLoadSuccess({
      gallery, album, id, photoLink: xmlUrl.link,
    }));
  } catch (error) {
    yield put(photoLoadError(normalizeError(error)));
  }
}

export const argsThumbImgPath = ({ gallery, filename }) => {
  const year = getYear(filename);
  const jpgFilename = replaceFileExtWithJpg(filename);

  return {
    path: `/public/gallery-${gallery}/media/thumbs/${year}/${jpgFilename}`,
  };
};

export function thumbFilenameCallsDropbox({ gallery, thumbs }) {
  console.log('thumbFilenameCallsDropbox gallery', gallery, 'thumbs', thumbs);
  const queueSagaCalls = thumb => call(
    [dbx, 'filesGetTemporaryLink'],
    argsThumbImgPath({ gallery, filename: thumb.filename }),
  );
  return thumbs.map(queueSagaCalls);
}


// saga WORKER for LOAD_NEXT_THUMB_PAGE
export function* getThumbPathsOnDropbox({ PAGE_SIZE: unitTestPageSize }) { // unit test overwrite constants
  console.log('saga WORKER for LOAD_NEXT_THUMB_PAGE 1');
  try {
    const pageSize = PAGE_SIZE || unitTestPageSize;
    // console.log('saga WORKER for LOAD_NEXT_THUMB_PAGE yield select(selectNextPage) 2', yield select(selectNextPage));
    const {
      gallery, album, memories, page: prevPage,
    } = yield select(selectNextPage);
    console.log('saga WORKER for LOAD_NEXT_THUMB_PAGE gallery 3', gallery, 'album', album);
    console.log('saga WORKER for LOAD_NEXT_THUMB_PAGE memories 4', memories, 'prevPage', prevPage);
    if (!memories || memories.length === 0) {
      throw new Error(`Empty or malformed album; memories=(${JSON.stringify(memories)})`);
    }

    const page = prevPage + 1;
    console.log('saga WORKER for LOAD_NEXT_THUMB_PAGE 4.5 (page)', page, '(pageSize)', pageSize, 'list', memories);
    const pagedMemories = getPage({ page, pageSize, list: memories });
    console.log('saga WORKER for LOAD_NEXT_THUMB_PAGE pagedMemories 5', pagedMemories, gallery);

    const dropboxResults = yield all(thumbFilenameCallsDropbox({ gallery, thumbs: pagedMemories }));
    console.log('saga WORKER for LOAD_NEXT_THUMB_PAGE dropboxResults 6', dropboxResults);
    const linkedMemories = pagedMemories.map((memory, index) => ({ ...memory, thumbLink: dropboxResults[index].link }));
    console.log('saga WORKER for LOAD_NEXT_THUMB_PAGE linkedMemories 7', linkedMemories);
    const hasMore = (pageSize * page) < memories.length;
    console.log('saga WORKER for LOAD_NEXT_THUMB_PAGE hasMore 8', hasMore);

    if (!hasMore) { // all pages processed so thumbs all have Dropbox links
      yield put(thumbsLoaded({
        gallery, album, newMemories: linkedMemories, page,
      }));
      return;
    }

    console.log('saga WORKER for LOAD_NEXT_THUMB_PAGE 9', gallery, album, linkedMemories, page);
    yield put(nextPageSuccess({
      gallery, album, newMemories: linkedMemories, page,
    }));
  } catch (error) {
    console.log('yield select(selectNextPage) error', error);
    yield put(nextPageError(normalizeError(error)));
  }
}


// ROOT saga manages WATCHER lifecycle
export default function* InfiniteThumbsSagaWatcher() {
  yield takeEvery([CHOOSE_MEMORY, NEXT_MEMORY, PREV_MEMORY], getPhotoPathsOnDropbox);
  yield takeEvery(LOAD_NEXT_THUMB_PAGE, getThumbPathsOnDropbox);
}
