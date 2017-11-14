/**
 * Test  sagas
 */

import Dropbox from 'dropbox';

/* eslint-disable redux-saga/yield-effects */
import { call } from 'redux-saga/effects';

import request from 'utils/request';

import { getDropboxAlbumFile, albumXmlArgs } from '../saga';

describe('AlbumViewPage Saga - getDropboxAlbumFile', () => {
  const dbx = new Dropbox({ accessToken: process.env.HISTORY_DROPBOX_ACCESS_TOKEN });

  const testArgs = { albumName: 'sample', galleryName: 'demo' };
  const generator = getDropboxAlbumFile(testArgs);

  it('should first yield an Effect call', () => {
    const actual = generator.next().value;
    const expected = call([dbx, 'filesGetTemporaryLink'], albumXmlArgs(testArgs));
    expect(actual).toEqual(expected);
  });

  it('should second yield an Effect call', () => {
    const actual = generator.next({ link: 'fake address' }).value;
    const expected = call(request, 'fake address');
    expect(actual).toEqual(expected);
  });
});
