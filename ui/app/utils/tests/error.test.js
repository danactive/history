import { normalizeError } from '../error';

describe('error', () => {
  describe('normalizeError', () => {
    it('Dropbox error summary', () => {
      const message = 'path/not_found/.';
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
          action: 'hide-thumb',
          title: `Dropbox asset is missing (${path})`,
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
      };
      expect(actual).toEqual(expected);
      expect(actualDebug).toEqual(expect.stringContaining('Error: Message'));
    });
  });
});
