/* global describe, expect, test */
import { Dropbox } from 'dropbox';
import 'whatwg-fetch';

import {
  all, call, put, select,
} from 'redux-saga/effects';
import { cloneableGenerator } from '@redux-saga/testing-utils';

import normalizeError from '../../../utils/error';
import request, { parseTextXml } from '../../../utils/request';

import {
  getAlbumFileOnDropbox,
  argsAlbumXmlPath,
  getThumbPathsOnDropbox,
  argsThumbImgPath,
} from '../saga';
import { selectNextPage } from '../selectors';
import {
  LOAD_ALBUM_SUCCESS,
  LOAD_ALBUM_ERROR,
  LOAD_NEXT_THUMB_PAGE_ERROR,
} from '../constants';
import {
  thumbsLoaded,
} from '../actions';

describe('AlbumViewPage Saga', () => {
  describe('getThumbPathsOnDropbox', () => {
    describe('Success', () => {
      const fixtures = {
        PAGE_SIZE: 8,
      };
      const generator = getThumbPathsOnDropbox(fixtures);

      test('Next Page select effect', () => {
        expect.hasAssertions();
        const received = generator.next().value;
        const expected = select(selectNextPage);
        expect(received).toEqual(expected);
      });

      test('a Dropbox HTTP request per thumbnail', () => {
        expect.hasAssertions();
        const array1toLength = Array.from({ length: 17 }, (v, k) => (
          { id: k + 1, filename: `2015-12-25-${k + 1}.jpg` }));
        const receivedArgs = {
          gallery: fixtures.gallery,
          album: fixtures.album,
          memories: array1toLength,
          page: 2,
        };
        const received = generator.next(receivedArgs).value;
        const expectedArgs = argsThumbImgPath({ gallery: fixtures.gallery, filename: '2015-12-25-17.jpg' });
        const expected = all([call([new Dropbox(), 'filesGetTemporaryLink'], expectedArgs)]);
        expect(received).toEqual(expected);
      });

      test('should third yield an Effect put', () => {
        expect.hasAssertions();
        const dropboxResults = [
          { link: 'dropbox.com' },
        ];
        const args = {
          gallery: fixtures.gallery,
          album: fixtures.album,
          newMemories: [
            {
              id: 17,
              filename: '2015-12-25-17.jpg',
              thumbLink: 'dropbox.com',
            },
          ],
          page: 3,
        };

        const received = generator.next(dropboxResults).value;
        const expected = put(thumbsLoaded(args));
        expect(received).toEqual(expected);
      });

      test('should be done', () => {
        expect.hasAssertions();
        const received = generator.next().done;
        const expected = true;
        expect(received).toEqual(expected);
      });
    });

    describe('Failure', () => {
      const fixtures = { thumbs: [], gallery: 'demo' };
      const generator = cloneableGenerator(getThumbPathsOnDropbox)(fixtures);

      generator.next(); // first yield an Effect select

      test('should receive an empty selector', () => {
        expect.hasAssertions();

        // cloning the generator before sending data
        const genClone = generator.clone();

        let received;
        let expected;

        const args = {
          memories: [],
        };
        received = genClone.next(args).value;

        const error = {
          message: 'Empty or malformed album; memories=([])',
          type: 'normalized message and stack',
          stack: true,
        };
        expected = put({ type: LOAD_NEXT_THUMB_PAGE_ERROR, error: normalizeError(error) });

        // Unit test cannot reproduce error stack so delete
        delete expected.payload.action.error.stack;
        delete received.payload.action.error.stack;

        expect(received).toEqual(expected);


        received = genClone.next().done;
        expected = true;
        expect(received).toEqual(expected);
      });

      test('should catch error', () => {
        expect.hasAssertions();

        // cloning the generator before sending data
        const genClone = generator.clone();

        let received;
        let expected;

        const error = new Error('Something went wrong');

        received = genClone.throw(error).value;
        expected = put({ type: LOAD_NEXT_THUMB_PAGE_ERROR, error: normalizeError(error) });

        expect(received).toEqual(expected);

        received = genClone.next().done;
        expected = true;
        expect(received).toEqual(expected);
      });
    });
  });
});
