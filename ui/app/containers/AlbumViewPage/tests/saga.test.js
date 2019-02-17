/* global describe, expect, test */
import { Dropbox } from 'dropbox';

import {
  all, call, put, select,
} from 'redux-saga/effects';
import { cloneableGenerator } from 'redux-saga/utils';

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
import { thumbsLoaded } from '../actions';

describe('AlbumViewPage Saga', () => {
  describe('getAlbumFileOnDropbox', () => {
    describe('Success', () => {
      const fixtures = { album: 'sample', gallery: 'demo' };
      const generator = getAlbumFileOnDropbox(fixtures);

      test('should first yield an Effect call', () => {
        expect.hasAssertions();
        const received = generator.next().value;
        const expected = call([new Dropbox(), 'filesGetTemporaryLink'], argsAlbumXmlPath(fixtures));
        expect(received).toEqual(expected);
      });

      test('should second yield an Effect call', () => {
        expect.hasAssertions();
        const received = generator.next({ link: 'fake address' }).value;
        const expected = call(request, 'fake address');
        expect(received).toEqual(expected);
      });

      test('should third yield an Effect put', () => {
        expect.hasAssertions();
        const xmlAlbum = `<album>
          <meta>
            <gallery>demo</gallery>
            <album_name>sample</album_name>
            <album_version>2.0</album_version>
            <geo>
              <google_zoom>11</google_zoom>
            </geo>
          </meta>
          <item id="1">
            <filename>2001-03-21-01.jpg</filename>
            <geo>
              <lat>49.25</lat>
              <lon>-123.1</lon>
            </geo>
            <photo_city>Vancouver, BC</photo_city>
            <photo_loc>Granville Island</photo_loc>
            <thumb_caption>Lunch</thumb_caption>
          </item>
        </album>`;
        const jsonAlbum = {
          caption: 'Lunch',
          city: 'Vancouver, BC',
          description: '',
          filename: '2001-03-21-01.jpg',
          coordinates: [-123.1, 49.25],
          id: '1',
          photoLink: null,
          thumbLink: null,
          location: 'Granville Island',
        };
        const received = generator.next(parseTextXml(xmlAlbum)).value;
        const expected = put({
          type: LOAD_ALBUM_SUCCESS,
          gallery: fixtures.gallery,
          album: fixtures.album,
          memories: [jsonAlbum],
        });
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
      const fixtures = { album: 'sample', gallery: 'demo' };
      const generator = getAlbumFileOnDropbox(fixtures);

      test('should first yield an Effect call', () => {
        expect.hasAssertions();
        const received = generator.next().value;
        const expected = call([new Dropbox(), 'filesGetTemporaryLink'], argsAlbumXmlPath(fixtures));
        expect(received).toEqual(expected);
      });

      test('should second yield an Error put', () => {
        expect.hasAssertions();
        const error = new Error('Something went wrong');

        const received = generator.throw(error).value;
        const expected = put({ type: LOAD_ALBUM_ERROR, error: normalizeError(error) });
        expect(received).toEqual(expected);
      });

      test('should be done', () => {
        expect.hasAssertions();
        const received = generator.next().done;
        const expected = true;
        expect(received).toEqual(expected);
      });
    });
  });

  describe('getThumbPathsOnDropbox', () => {
    describe('Success', () => {
      const fixtures = {
        gallery: 'demo',
        album: 'sample',
      };
      const generator = getThumbPathsOnDropbox(fixtures);

      test('should first yield an Effect select', () => {
        expect.hasAssertions();
        const received = generator.next().value;
        const expected = select(selectNextPage);
        expect(received).toEqual(expected);
      });

      test('should second yield an Effect all', () => {
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
        delete expected.PUT.action.error.stack;
        delete received.PUT.action.error.stack;

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
