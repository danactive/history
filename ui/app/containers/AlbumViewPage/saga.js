/* global window */
import { Dropbox } from 'dropbox';
import {
  all, call, put, select, takeEvery,
} from 'redux-saga/effects';
import 'whatwg-fetch';

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

const dbx = new Dropbox({
  accessToken: process.env.HISTORY_DROPBOX_ACCESS_TOKEN,
  fetch: window.fetch,
});


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


// saga WORKER for LOAD_ALBUM
export function* getAlbumFileOnDropbox({ gallery, album }) {
  console.log('AlbumViewPage/saga getAlbumFileOnDropbox');
  try {
    console.log('getAlbumFileOnDropbox1 obj', dbx, 'method', dbx.filesGetTemporaryLink, 'args', argsAlbumXmlPath({ gallery, album }));
    const xmlUrl = yield call([dbx, 'filesGetTemporaryLink'], argsAlbumXmlPath({ gallery, album }));
    console.log('getAlbumFileOnDropbox2', xmlUrl);
    const xmlFile = yield call(request, xmlUrl.link);
    console.log('getAlbumFileOnDropbox3', xmlFile);
    const memories = getItemNodes(xmlFile).map(parseItemNode);
    console.log('out', albumLoadSuccess({ gallery, album, memories }));
    yield put(albumLoadSuccess({ gallery, album, memories }));
  } catch (error) {
    yield put(albumLoadError(normalizeError(error)));
  }
}


// ROOT saga manages WATCHER lifecycle
export default function* AlbumViewPageSagaWatcher() {
  yield takeEvery(LOAD_ALBUM, getAlbumFileOnDropbox);
}
