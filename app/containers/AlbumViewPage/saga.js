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

const dbx = new Dropbox({ accessToken: process.env.HISTORY_DROPBOX_ACCESS_TOKEN });

function parseFromNode(ascendant) {
  return (descendant) => {
    const tags = ascendant.getElementsByTagName(descendant);
    if (tags.length > 0) {
      return tags[0].innerHTML;
    }

    return '';
  };
}

function parseAlbum(albumXml) {
  const parseNode = parseFromNode(albumXml);
  return {
    id: albumXml.getAttribute('id'),
    filename: parseNode('filename'),
    city: parseNode('photo_city'),
    location: parseNode('photo_loc'),
    geo: [parseNode('lon'), parseNode('lat')],
    caption: parseNode('thumb_caption'),
  };
}

export const albumXmlArgs = ({ albumName, galleryName }) => ({
  path: `/public/gallery-${galleryName}/xml/album_${albumName}.xml`,
});

// Dropbox API v2 request/response handler
export function* getDropboxAlbumFile({ albumName, galleryName }) {
  try {
    const albumXmlUrl = yield call([dbx, 'filesGetTemporaryLink'], albumXmlArgs({ albumName, galleryName }));
    const albumXmlFile = yield call(request, albumXmlUrl.link);
    const thumbs = Array.from(albumXmlFile.getElementsByTagName('item')).map(parseAlbum);

    yield put(albumLoaded(thumbs, galleryName));
  } catch (error) {
    yield put(albumLoadingError(error));
  }
}

export function* getDropboxThumbFilename({ thumbs, galleryName }) {
  try {
    const yields = thumbs.map((thumb) => {
      if (thumb.filename.toLowerCase().includes('jpg')) { // TODO add video support by dropping this `if`
        const year = thumb.filename.substr(0, 4);
        const path = `/public/gallery-${galleryName}/media/thumbs/${year}/${thumb.filename}`;
        return call([dbx, dbx.filesGetTemporaryLink], { path }); // eslint-disable-line redux-saga/yield-effects
      }

      return { link: null };
    });
    const dropboxResults = yield all(yields);
    const out = thumbs.map((thumb, index) => ({ ...thumb, link: dropboxResults[index].link }));
    yield put(thumbLinksLoaded(out));
  } catch (error) {
    yield put(thumbLinksLoadingError(normalizeError(error)));
  }
}

// ROOT saga manages WATCHER lifecycle
export default function* AlbumViewPageSagaWatcher() {
  yield takeLatest(LOAD_ALBUM, getDropboxAlbumFile);
  yield takeLatest(LOAD_ALBUM_SUCCESS, getDropboxThumbFilename);
}
