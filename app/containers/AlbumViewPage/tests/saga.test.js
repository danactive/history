/* eslint-disable redux-saga/yield-effects */
import Dropbox from 'dropbox';

import { call, put } from 'redux-saga/effects';

import request, { parseTextXml } from 'utils/request';

import { getDropboxAlbumFile, albumXmlArgs } from '../saga';
import { LOAD_ALBUM_SUCCESS } from '../constants';

describe('AlbumViewPage Saga - getDropboxAlbumFile', () => {
  const testArgs = { albumName: 'sample', galleryName: 'demo' };
  const generator = getDropboxAlbumFile(testArgs);

  it('should first yield an Effect call', () => {
    const received = generator.next().value;
    const expected = call([new Dropbox(), 'filesGetTemporaryLink'], albumXmlArgs(testArgs));
    expect(received).toEqual(expected);
  });

  it('should second yield an Effect call', () => {
    const received = generator.next({ link: 'fake address' }).value;
    const expected = call(request, 'fake address');
    expect(received).toEqual(expected);
  });

  it('should third yield an Effect call', () => {
    const received = generator.next(parseTextXml('')).value;
    const expected = put({ type: LOAD_ALBUM_SUCCESS, thumbs: [], galleryName: 'demo' });
    expect(received).toEqual(expected);
  });

  it('should be done', () => {
    const received = generator.next().done;
    const expected = true;
    expect(received).toEqual(expected);
  });
});
