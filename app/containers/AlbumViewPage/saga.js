import Dropbox from 'dropbox';
import { all, call, put, takeLatest } from 'redux-saga/effects';

import { normalizeError } from 'utils/error';
import request from 'utils/request';

import { LOAD_ALBUM, LOAD_ALBUM_SUCCESS } from './constants';
import {
  albumLoaded,
  albumLoadingError,
  thumbLinksLoaded,
  thumbLinksLoadingError,
} from './actions';
import { getItemNodes, parseItemNode } from './transformXmlToJson';

const dbx = new Dropbox({ accessToken: process.env.HISTORY_DROPBOX_ACCESS_TOKEN });


export const argsAlbumXmlPath = ({ galleryName, albumName }) => ({
  path: `/public/gallery-${galleryName}/xml/album_${albumName}.xml`,
});


export const argsThumbImgPath = (galleryName, filename) => {
  const year = filename.substr(0, 4);

  return {
    path: `/public/gallery-${galleryName}/media/thumbs/${year}/${filename}`,
  };
};


export function thumbFilenameCallsDropbox({ galleryName, thumbs }) {
  return thumbs.map((thumb) => {
    if (thumb.filename.toLowerCase().includes('jpg')) { // TODO add video support by dropping this `if`
      // eslint-disable-next-line redux-saga/yield-effects
      return call([dbx, 'filesGetTemporaryLink'], argsThumbImgPath(galleryName, thumb.filename));
    }

    return { link: null };
  });
}


// saga WORKER for LOAD_ALBUM
export function* getAlbumFileOnDropbox({ galleryName, albumName }) {
  try {
    const xmlUrl = yield call([dbx, 'filesGetTemporaryLink'], argsAlbumXmlPath({ albumName, galleryName }));
    const xmlFile = yield call(request, xmlUrl.link);
    const thumbs = getItemNodes(xmlFile).map(parseItemNode);

    yield put(albumLoaded(thumbs, galleryName));
  } catch (error) {
    yield put(albumLoadingError(normalizeError(error)));
  }
}

// saga WORKER for LOAD_ALBUM_SUCCESS
export function* getThumbPathsOnDropbox({ galleryName, thumbs }) {
  try {
    const dropboxResults = yield all(thumbFilenameCallsDropbox({ galleryName, thumbs }));
    const linkedThumbs = thumbs.map((thumb, index) => ({ ...thumb, link: dropboxResults[index].link }));
    yield put(thumbLinksLoaded(linkedThumbs));
  } catch (error) {
    yield put(thumbLinksLoadingError(normalizeError(error)));
  }
}


// ROOT saga manages WATCHER lifecycle
export default function* AlbumViewPageSagaWatcher() {
  yield takeLatest(LOAD_ALBUM, getAlbumFileOnDropbox);
  yield takeLatest(LOAD_ALBUM_SUCCESS, getThumbPathsOnDropbox);
}
