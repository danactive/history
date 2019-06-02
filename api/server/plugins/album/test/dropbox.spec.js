const test = require('tape-catch');

test('Album plugin - Dropbox', { skip: false }, (describe) => {
  const json = require('../lib/json');
  const { createTransform } = require('../lib/dropbox');

  describe.test('* Transform', { skip: false }, async (assert) => {
    const xml = await json.getAlbum('demo', 'sample');

    const fakeDropbox = {
      filesGetTemporaryLink: ({ path }) => Promise.resolve({ link: `dropbox://${path}` }),
    };

    const transform = createTransform(fakeDropbox);
    const cloud = await transform(xml, 'thumbPath');

    const actual = cloud.album.items[0].thumbPath;
    const expected = xml.album.items[0].thumbPath;
    assert.notEqual(actual, expected, 'Thumbnail path correctly changed');
    assert.ok(actual.startsWith('dropbox://'), 'Thumbnail path transformed');

    assert.end();
  });

  describe.test('* Transform with errors', { skip: false }, async (assert) => {
    const xml = await json.getAlbum('demo', 'sample');
    xml.album.items.splice(1); // reduce error check for every photo in gallery to one

    const errors = [
      { error: { message: 'ErrorMessage', error_summary: 'ErrorSummary' } },
      { error: { error_summary: 'ErrorSummary' } },
      { error: 'JustError' },
      { fallback: 'Fallback' },
    ];

    assert.plan(2 * errors.length);


    async function testPerError(error) {
      const fakeDropbox = {
        filesGetTemporaryLink: () => Promise.reject(error),
      };

      const transform = createTransform(fakeDropbox);
      const cloud = await transform(xml, 'thumbPath');
      let actual;
      let expected;


      actual = cloud.album.items[0].thumbPath;
      expected = xml.album.items[0].thumbPath;
      assert.notEqual(actual, expected, 'Thumbnail path correctly changed');


      actual = cloud.album.items[0].thumbPath;
      expected = null;
      assert.equal(actual, expected, 'Thumbnail path is missing due to Dropbox error');
    }


    errors.forEach(error => testPerError(error));
  });
});
