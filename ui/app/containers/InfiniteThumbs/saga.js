import { Dropbox } from 'dropbox';
import {
  call, put, select, takeEvery,
} from 'redux-saga/effects';

import normalizeError from '../../utils/error';

import { CHOOSE_MEMORY } from '../App/constants';
import { makeSelectCurrentMemory } from '../App/selectors';
import { photoLoadError, photoLoadSuccess } from '../App/actions';
import {
  NEXT_MEMORY,
  PREV_MEMORY,
} from '../AlbumViewPage/constants';


const dbx = new Dropbox({ accessToken: process.env.HISTORY_DROPBOX_ACCESS_TOKEN });


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
    const { currentMemory, album, gallery } = yield select(makeSelectCurrentMemory());
    const { filename, id } = currentMemory;
    const xmlUrl = yield call([dbx, 'filesGetTemporaryLink'], argsPhotoXmlPath({ gallery, filename }));

    yield put(photoLoadSuccess({
      gallery, album, id, photoLink: xmlUrl.link,
    }));
  } catch (error) {
    yield put(photoLoadError(normalizeError(error)));
  }
}


// ROOT saga manages WATCHER lifecycle
export default function* InfiniteThumbsSagaWatcher() {
  yield takeEvery([CHOOSE_MEMORY, NEXT_MEMORY, PREV_MEMORY], getPhotoPathsOnDropbox);
}
