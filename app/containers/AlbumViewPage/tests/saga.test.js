/* eslint-disable redux-saga/yield-effects */
import Dropbox from 'dropbox';

import { all, call, put, select } from 'redux-saga/effects';

import { normalizeError } from 'utils/error';
import request, { parseTextXml } from 'utils/request';

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

describe('AlbumViewPage thumbFilenameCalls', () => {

});

describe('AlbumViewPage Saga', () => {
  describe('getAlbumFileOnDropbox', () => {
    describe('Success', () => {
      const fixtures = { album: 'sample', gallery: 'demo' };
      const generator = getAlbumFileOnDropbox(fixtures);

      it('should first yield an Effect call', () => {
        const received = generator.next().value;
        const expected = call([new Dropbox(), 'filesGetTemporaryLink'], argsAlbumXmlPath(fixtures));
        expect(received).toEqual(expected);
      });

      it('should second yield an Effect call', () => {
        const received = generator.next({ link: 'fake address' }).value;
        const expected = call(request, 'fake address');
        expect(received).toEqual(expected);
      });

      it('should third yield an Effect put', () => {
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
          geo: [-123.1, 49.25],
          id: '1',
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

      it('should be done', () => {
        const received = generator.next().done;
        const expected = true;
        expect(received).toEqual(expected);
      });
    });

    describe('Failure', () => {
      const fixtures = { album: 'sample', gallery: 'demo' };
      const generator = getAlbumFileOnDropbox(fixtures);

      it('should first yield an Effect call', () => {
        const received = generator.next().value;
        const expected = call([new Dropbox(), 'filesGetTemporaryLink'], argsAlbumXmlPath(fixtures));
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
      const fixtures = {
        gallery: 'demo',
        album: 'sample',
      };
      const generator = getThumbPathsOnDropbox(fixtures);

      it('should first yield an Effect select', () => {
        const received = generator.next().value;
        const expected = select(selectNextPage);
        expect(received).toEqual(expected);
      });

      it('should second yield an Effect all', () => {
        const args = {
          gallery: fixtures.gallery,
          album: fixtures.album,
          memories: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          page: 2,
        };
        const received = generator.next(args).value;
        const expected = all([call([new Dropbox(), 'filesGetTemporaryLink'], argsThumbImgPath(args))]);
        expect(received).toEqual(expected);
      });

      it('should third yield an Effect put', () => {
        const dropboxResults = [{ link: 'dropbox.com' }];

        const received = generator.next(dropboxResults).value;
        const expected = put(thumbsLoaded(dropboxResults));
        expect(received).toEqual(expected);
      });

      it('should be done', () => {
        const received = generator.next().done;
        const expected = true;
        expect(received).toEqual(expected);
      });
    });

    describe('Failure - empty selector', () => {
      const fixtures = { thumbs: [], gallery: 'demo' };
      const generator = getThumbPathsOnDropbox(fixtures);

      it('should first yield an Effect select', () => {
        const received = generator.next().value;
        const expected = select(selectNextPage);
        expect(received).toEqual(expected);
      });

      it('should second yield an Effect put', () => {
        const received = generator.next().value;

        const error = {
          message: 'Empty or malformed album',
        };
        const expected = put({ type: LOAD_NEXT_THUMB_PAGE_ERROR, error: normalizeError(error) });

        expect(received).toEqual(expected);
      });

      it('should be done', () => {
        const received = generator.next().done;
        const expected = true;
        expect(received).toEqual(expected);
      });
    });

    describe('Failure - catch error', () => {
      const fixtures = { thumbs: [], gallery: 'demo' };
      const generator = getThumbPathsOnDropbox(fixtures);

      it('should first yield an Effect select', () => {
        const received = generator.next().value;
        const expected = select(selectNextPage);
        expect(received).toEqual(expected);
      });

      it('should second yield an Effect put', () => {
        const error = new Error('Something went wrong');

        const received = generator.throw(error).value;
        const expected = put({ type: LOAD_NEXT_THUMB_PAGE_ERROR, error: normalizeError(error) });

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
