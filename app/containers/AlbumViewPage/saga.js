import Dropbox from 'dropbox';
import { all, call, put, select, takeEvery } from 'redux-saga/effects';

import { normalizeError } from 'utils/error';
import request from 'utils/request';

import { LOAD_ALBUM, LOAD_NEXT_THUMB_PAGE } from './constants';
import {
  albumLoadSuccess,
  albumLoadError,
  nextPageSuccess,
  nextPageError,
  thumbsLoaded,
} from './actions';
import { makeSelectNextPage } from './selectors';
import { getItemNodes, parseItemNode } from './transformXmlToJson';

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


const setPagedThumbs = (pageSize, list = []) => (page) => list.slice((page - 1) * pageSize, page * pageSize);


export function thumbFilenameCallsDropbox({ gallery, metaThumbs }) {
  // eslint-disable-next-line redux-saga/yield-effects
  return metaThumbs.map((thumb) => call([dbx, 'filesGetTemporaryLink'], argsThumbImgPath({ gallery, filename: thumb.filename })));
}


// saga WORKER for LOAD_ALBUM
export function* getAlbumFileOnDropbox({ gallery, album }) {
  try {
    const xmlUrl = yield call([dbx, 'filesGetTemporaryLink'], argsAlbumXmlPath({ gallery, album }));
    const xmlFile = yield call(request, xmlUrl.link);
    const metaThumbs = getItemNodes(xmlFile).map(parseItemNode);

    yield put(albumLoadSuccess({ gallery, album, metaThumbs }));
  } catch (error) {
    yield put(albumLoadError(normalizeError(error)));
  }
}


// saga WORKER for LOAD_NEXT_THUMB_PAGE
export function* getThumbPathsOnDropbox() {
  try {
    const { gallery, album, metaThumbs, thumbs, page } = yield select(makeSelectNextPage());
    const PAGE_SIZE = 8;
    const getPagedThumbs = setPagedThumbs(PAGE_SIZE, metaThumbs);
    const pagedMetaThumbs = getPagedThumbs(page);
    const hasMore = (PAGE_SIZE * page) < metaThumbs.length;

    const dropboxResults = yield all(thumbFilenameCallsDropbox({ gallery, metaThumbs: pagedMetaThumbs }));
    const linkedThumbs = pagedMetaThumbs.map((thumb, index) => ({ ...thumb, link: dropboxResults[index].link }));
    const growingThumbs = thumbs.concat(linkedThumbs);

    if (!hasMore) { // all pages processed so thumbs all have Dropbox links
      yield put(thumbsLoaded(growingThumbs));
      return;
    }

    yield put(nextPageSuccess({ gallery, album, thumbs: growingThumbs, page: page + 1, hasMore: true }));
  } catch (error) {
    yield put(nextPageError(normalizeError(error)));
  }
}


// ROOT saga manages WATCHER lifecycle
export default function* AlbumViewPageSagaWatcher() {
  yield takeEvery(LOAD_ALBUM, getAlbumFileOnDropbox);
  yield takeEvery(LOAD_NEXT_THUMB_PAGE, getThumbPathsOnDropbox);
}
