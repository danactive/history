import { Dropbox } from 'dropbox';
import { fetch } from 'whatwg-fetch';

import { call, put, select } from 'redux-saga/effects';

import normalizeDropboxError from '../../../utils/error';
import request, { parseTextXml } from '../../../utils/request';

import {
  getAlbumFileOnDropbox,
  argsAlbumXmlPath,
  getThumbPaths,
  videoExtToJpg,
  getThumbPathsOnDropbox,
} from '../saga';
import { selectNextPage } from '../selectors';
import { LOAD_ALBUM_SUCCESS, LOAD_ALBUM_ERROR } from '../constants';
import albumFixture from '../../App/tests/fixtures/album.json';

describe('AlbumViewPage Saga', () => {
  describe('getAlbumFile on Dropbox', () => {
    describe('Success', () => {
      const fixtures = { host: 'dropbox', album: 'sample', gallery: 'demo' };
      const generator = getAlbumFileOnDropbox(fixtures);

      test('should first yield an Effect call', () => {
        expect.hasAssertions();
        const received = generator.next().value;
        const expected = call(
          [new Dropbox({ fetch }), 'filesGetTemporaryLink'],
          argsAlbumXmlPath(fixtures),
        );
        // Unit test cannot reproduce global fetch so delete
        delete received.fetch;
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
          videoLink: null,
          location: 'Granville Island',
        };
        const received = generator.next(parseTextXml(xmlAlbum)).value;
        const expected = put({
          type: LOAD_ALBUM_SUCCESS,
          host: 'dropbox',
          gallery: 'demo',
          album: 'sample',
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
      const fixtures = { host: 'dropbox', album: 'sample', gallery: 'demo' };
      const generator = getAlbumFileOnDropbox(fixtures);

      test('should first yield an Effect call', () => {
        expect.hasAssertions();
        const received = generator.next().value;
        const expected = call(
          [new Dropbox({ fetch }), 'filesGetTemporaryLink'],
          argsAlbumXmlPath(fixtures),
        );
        expect(received).toEqual(expected);
      });

      test('should second yield an Error put', () => {
        expect.hasAssertions();
        const error = new Error('Something went wrong');

        const received = generator.throw(error).value;
        const expected = put({
          type: LOAD_ALBUM_ERROR,
          error: normalizeDropboxError(error),
          errorMsg: undefined,
          host: 'dropbox',
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
  });

  describe('getThumbPaths on Dropbox', () => {
    describe('Success', () => {
      const fixtures = {
        host: 'dropbox',
        gallery: 'demo',
        album: 'sample',
        memories: albumFixture.memories,
      };
      const generator = getThumbPaths(fixtures); // set state

      test('should first yield an Effect select', () => {
        expect.hasAssertions();
        const received = generator.next().value;
        const expected = select(selectNextPage);
        expect(received).toEqual(expected);
      });

      test('should second yield an Effect call', () => {
        expect.hasAssertions();
        const receivedArgs = {
          host: fixtures.host,
          gallery: fixtures.gallery,
          album: fixtures.album,
          page: 2,
        };

        const received = generator.next(receivedArgs).value;
        const expected = call(getThumbPathsOnDropbox, receivedArgs);
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

  describe('videoExtToJpg', () => {
    test('No filename change', () => {
      expect.hasAssertions();

      expect(videoExtToJpg('abc.txt')).toEqual('abc.txt');
      expect(videoExtToJpg('abc.jpg')).toEqual('abc.jpg');
    });

    test('Filename changes from video to image', () => {
      expect.hasAssertions();

      expect(videoExtToJpg('abc.mp4')).toEqual('abc.jpg');
    });
  });
});
