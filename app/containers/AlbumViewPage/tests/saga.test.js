/* eslint-disable redux-saga/yield-effects */
import Dropbox from 'dropbox';

import { all, call, put } from 'redux-saga/effects';

import { normalizeError } from 'utils/error';
import request, { parseTextXml } from 'utils/request';

import { getAlbumFileOnDropbox, argsAlbumXmlPath, getThumbPathsOnDropbox } from '../saga';
import {
  LOAD_ALBUM_SUCCESS,
  LOAD_ALBUM_ERROR,
  LOAD_THUMB_LINKS_SUCCESS,
  LOAD_THUMB_LINKS_ERROR,
} from '../constants';

describe('AlbumViewPage thumbFilenameCalls', () => {

});

describe('AlbumViewPage Saga', () => {
  describe('getAlbumFileOnDropbox', () => {
    describe('Success', () => {
      const testArgs = { albumName: 'sample', galleryName: 'demo' };
      const generator = getAlbumFileOnDropbox(testArgs);

      it('should first yield an Effect call', () => {
        const received = generator.next().value;
        const expected = call([new Dropbox(), 'filesGetTemporaryLink'], argsAlbumXmlPath(testArgs));
        expect(received).toEqual(expected);
      });

      it('should second yield an Effect call', () => {
        const received = generator.next({ link: 'fake address' }).value;
        const expected = call(request, 'fake address');
        expect(received).toEqual(expected);
      });

      it('should third yield an Effect put', () => {
        const received = generator.next(parseTextXml('')).value;
        const expected = put({ type: LOAD_ALBUM_SUCCESS, thumbs: [], galleryName: testArgs.galleryName });
        expect(received).toEqual(expected);
      });

      it('should be done', () => {
        const received = generator.next().done;
        const expected = true;
        expect(received).toEqual(expected);
      });
    });

    describe('Failure', () => {
      const testArgs = { albumName: 'albumName', galleryName: 'galleryName' };
      const generator = getAlbumFileOnDropbox(testArgs);

      it('should first yield an Effect call', () => {
        const received = generator.next().value;
        const expected = call([new Dropbox(), 'filesGetTemporaryLink'], argsAlbumXmlPath(testArgs));
        expect(received).toEqual(expected);
      });

      it('should second yield an Error put', () => {
        const error = new Error('Something went wrong');

        const received = generator.throw(error).value;
        const expected = put({ type: LOAD_ALBUM_ERROR, error: normalizeError(error) });
        expect(received).toEqual(expected);
      });

      it('should be done', () => {
        const received = generator.next().done;
        const expected = true;
        expect(received).toEqual(expected);
      });
    });
  });

  describe('getThumbPathsOnDropbox', () => {
    describe('Success', () => {
      const testArgs = { thumbs: [], galleryName: 'demo' };
      const generator = getThumbPathsOnDropbox(testArgs);

      it('should first yield an Effect all', () => {
        const received = generator.next().value;
        const expected = all([]);
        expect(received).toEqual(expected);
      });

      it('should second yield an Effect put', () => {
        const received = generator.next().value;
        const expected = put({ type: LOAD_THUMB_LINKS_SUCCESS, thumbs: [] });
        expect(received).toEqual(expected);
      });

      it('should be done', () => {
        const received = generator.next().done;
        const expected = true;
        expect(received).toEqual(expected);
      });
    });

    describe('Failure', () => {
      const testArgs = { thumbs: [], galleryName: 'demo' };
      const generator = getThumbPathsOnDropbox(testArgs);

      it('should first yield an Effect all', () => {
        const received = generator.next().value;
        const expected = all([]);
        expect(received).toEqual(expected);
      });

      it('should second yield an Effect put', () => {
        const error = new Error('Something went wrong');

        const received = generator.throw(error).value;
        const expected = put({ type: LOAD_THUMB_LINKS_ERROR, error: normalizeError(error) });
        expect(received).toEqual(expected);
      });

      it('should be done', () => {
        const received = generator.next().done;
        const expected = true;
        expect(received).toEqual(expected);
      });
    });
  });
});
