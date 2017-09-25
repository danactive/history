const test = require('tape-catch');

test('Album plugin - Dropbox', { skip: false }, (describe) => {
  const json = require('../lib/json');
  const lib = require('../lib/dropbox');

  describe.test('* Check for safe paths', { skip: true }, async (assert) => {
    const xml = await json.getAlbum('demo', 'sample');
    const d = await lib.transform(xml, 'thumbPath');

    assert.ok(d, 'How do I test this?');

    assert.end();
  });
});
