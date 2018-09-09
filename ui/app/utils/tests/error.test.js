import { normalizeError } from '../error';

describe('error', () => {
  describe('normalizeError', () => {
    it('Dropbox error with summary', () => {
      const message = 'path/not_found/..';
      const path = '/public/gallery-dan/media/thumbs/2015/2015-12-02-62.jpg';
      const status = 409;

      const error = {
        error: {
          error_summary: message,
        },
        status,
        response: {
          req: {
            _data: {
              path,
            },
          },
        },
      };
      const actual = normalizeError(error);
      const expected = {
        message,
        status,
        type: 'normalized error_summary',
        ui: {
          action: 'missing-thumbLink',
          path,
          title: `Dropbox asset is missing (${path})`,
        }
      };
      expect(actual).toEqual(expected);
    });

    it('Dropbox error with response', () => {
      const message = 'Error in call to API function "files/get_temporary_link": The given OAuth 2 access token is malformed.';
      const path = '/public/gallery-dan/xml/album_cuba2015.xml';
      const status = 400;

      const error = {
        error: message,
        status,
        response: {
          badRequest: true,
          clientError: true,
          text: message,
          req: {
            header: {
              Authorization: 'Bearer undefined',
            },
            _data: {
              path,
            },
          }
        },
      };
      const actual = normalizeError(error);
      const expected = {
        message,
        status,
        type: 'normalized error_response',
        ui: {
          action: 'incorrect-auth',
          path,
          title: `Dropbox auth is incorrect (${path})`,
        }
      };
      expect(actual).toEqual(expected);
    });

    it('Normal JavaScript error', () => {
      const error = new Error('Message');
      const actual = normalizeError(error);

      // Error stack tricky to test
      const actualDebug = actual.stack;
      delete actual.stack;

      const expected = {
        message: 'Message',
        type: 'normalized message and stack',
        ui: {
          action: undefined,
          title: 'Message',
        }
      };
      expect(actual).toEqual(expected);
      expect(actualDebug).toEqual(expect.stringContaining('Error: Message'));
    });
  });
});
