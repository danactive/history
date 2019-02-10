import Dropbox from 'dropbox';
import {
  all, call, put, select, takeEvery,
} from 'redux-saga/effects';

import normalizeError from '../../utils/error';
import request from '../../utils/request';

import { LOAD_ALBUM, LOAD_NEXT_THUMB_PAGE, PAGE_SIZE } from './constants';
import {
  albumLoadSuccess,
  albumLoadError,
  nextPageSuccess,
  nextPageError,
  thumbsLoaded,
} from './actions';
import { selectNextPage } from './selectors';
import { getItemNodes, parseItemNode } from './transformXmlToJson';
import { getPage } from './paging';

const dbx = new Dropbox({ accessToken: process.env.HISTORY_DROPBOX_ACCESS_TOKEN });


export const argsAlbumXmlPath = ({ gallery, album }) => ({
  path: `/public/gallery-${gallery}/xml/album_${album}.xml`,
});


const getYear = (filename = '') => filename.substr(0, 4);


const replaceFileExtWithJpg = (filename = '') => `${filename.substr(0, filename.lastIndexOf('.'))}.jpg`;


export const argsThumbImgPath = ({ gallery, filename }) => {
  const year = getYear(filename);
  const jpgFilename = replaceFileExtWithJpg(filename);

  return {
    path: `/public/gallery-${gallery}/media/thumbs/${year}/${jpgFilename}`,
  };
};


export function thumbFilenameCallsDropbox({ gallery, thumbs }) {
  const queueSagaCalls = thumb => call(
    [dbx, 'filesGetTemporaryLink'],
    argsThumbImgPath({ gallery, filename: thumb.filename }),
  );
  return thumbs.map(queueSagaCalls);
}


// saga WORKER for LOAD_ALBUM
export function* getAlbumFileOnDropbox({ gallery, album }) {
  try {
    const xmlUrl = yield call([dbx, 'filesGetTemporaryLink'], argsAlbumXmlPath({ gallery, album }));
    const xmlFile = yield call(request, xmlUrl.link);
    const memories = getItemNodes(xmlFile).map(parseItemNode);

    yield put(albumLoadSuccess({ gallery, album, memories }));
  } catch (error) {
    yield put(albumLoadError(normalizeError(error)));
  }
}


// saga WORKER for LOAD_NEXT_THUMB_PAGE
export function* getThumbPathsOnDropbox() {
  try {
    const {
      gallery, album, memories, page: prevPage,
    } = yield select(selectNextPage);
    if (!memories || memories.length === 0) {
      throw new Error(`Empty or malformed album; memories=(${JSON.stringify(memories)})`);
    }

    const page = prevPage + 1;
    const pagedMemories = getPage({ page, pageSize: PAGE_SIZE, list: memories });

    const hasMore = (PAGE_SIZE * page) < memories.length;

    const dropboxResults = yield all(thumbFilenameCallsDropbox({ gallery, thumbs: pagedMemories }));
    const linkedMemories = pagedMemories.map((memory, index) => ({ ...memory, thumbLink: dropboxResults[index].link }));

    if (!hasMore) { // all pages processed so thumbs all have Dropbox links
      yield put(thumbsLoaded({
        gallery, album, newMemories: linkedMemories, page,
      }));
      return;
    }

    yield put(nextPageSuccess({
      gallery, album, newMemories: linkedMemories, page,
    }));
  } catch (error) {
    yield put(nextPageError(normalizeError(error)));
  }
}


// ROOT saga manages WATCHER lifecycle
export default function* AlbumViewPageSagaWatcher() {
  yield takeEvery(LOAD_ALBUM, getAlbumFileOnDropbox);
  yield takeEvery(LOAD_NEXT_THUMB_PAGE, getThumbPathsOnDropbox);
}
