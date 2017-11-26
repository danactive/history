import Dropbox from 'dropbox';
import { all, call, put, takeLatest, takeEvery } from 'redux-saga/effects';

import { normalizeError } from 'utils/error';
import request from 'utils/request';

import { LOAD_ALBUM, LOAD_ALBUM_SUCCESS, LOAD_THUMB_LINKS_NEXT } from './constants';
import {
  albumLoaded,
  albumLoadingError,
  thumbLinksLoaded,
  thumbLinksNext,
  thumbLinksLoadingError,
} from './actions';
import { getItemNodes, parseItemNode } from './transformXmlToJson';

const dbx = new Dropbox({ accessToken: process.env.HISTORY_DROPBOX_ACCESS_TOKEN });


export const argsAlbumXmlPath = ({ gallery, album }) => ({
  path: `/public/gallery-${gallery}/xml/album_${album}.xml`,
});


const getYear = (filename) => filename.substr(0, 4);


const replaceFileExtWithJpg = (filename) => `${filename.substr(0, filename.lastIndexOf('.'))}.jpg`;


export const argsThumbImgPath = (gallery, filename) => {
  const year = getYear(filename);
  const jpgFilename = replaceFileExtWithJpg(filename);

  return {
    path: `/public/gallery-${gallery}/media/thumbs/${year}/${jpgFilename}`,
  };
};


const setPagedThumbs = (pageSize, list = []) => (page) => list.slice((page - 1) * pageSize, page * pageSize);


export function thumbFilenameCallsDropbox({ gallery, metaThumbs }) {
  // eslint-disable-next-line redux-saga/yield-effects
  return metaThumbs.map((thumb) => call([dbx, 'filesGetTemporaryLink'], argsThumbImgPath(gallery, thumb.filename)));
}


// saga WORKER for LOAD_ALBUM
export function* getAlbumFileOnDropbox({ gallery, album }) {
  try {
    const xmlUrl = yield call([dbx, 'filesGetTemporaryLink'], argsAlbumXmlPath({ gallery, album }));
    const xmlFile = yield call(request, xmlUrl.link);
    const metaThumbs = getItemNodes(xmlFile).map(parseItemNode);

    yield put(albumLoaded(gallery, metaThumbs));
  } catch (error) {
    yield put(albumLoadingError(normalizeError(error)));
  }
}


// saga WORKER for LOAD_ALBUM_SUCCESS or LOAD_THUMB_LINKS_NEXT
export function* getThumbPathsOnDropbox({ gallery, thumbs = [], metaThumbs, page = 1 }) {
  try {
    const getPagedThumbs = setPagedThumbs(10, metaThumbs);
    const pagedMetaThumbs = getPagedThumbs(page);
    const dropboxResults = yield all(thumbFilenameCallsDropbox({ gallery, metaThumbs: pagedMetaThumbs }));
    const linkedThumbs = pagedMetaThumbs.map((thumb, index) => ({ ...thumb, link: dropboxResults[index].link }));
    const growingThumbs = thumbs.concat(linkedThumbs);

    if (pagedMetaThumbs.length === 0) {
      yield put(thumbLinksLoaded(growingThumbs));
    } else {
      yield put(thumbLinksNext({ gallery, thumbs: growingThumbs, metaThumbs, page: page + 1 }));
    }
  } catch (error) {
    yield put(thumbLinksLoadingError(normalizeError(error)));
  }
}


// ROOT saga manages WATCHER lifecycle
export default function* AlbumViewPageSagaWatcher() {
  yield takeLatest(LOAD_ALBUM, getAlbumFileOnDropbox);
  yield takeLatest(LOAD_ALBUM_SUCCESS, getThumbPathsOnDropbox);
  yield takeEvery(LOAD_THUMB_LINKS_NEXT, getThumbPathsOnDropbox);
}
