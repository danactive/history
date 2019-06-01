const tape = require('tape-catch');

tape('Gallery', { skip: false }, (describe) => {
  const lib = require('../lib/gallery');

  describe.test('* Get Galleries', { skip: false }, async (assert) => {
    try {
      const galleries = await lib.getGalleries();

      assert.ok(galleries.length > 0, 'One or more galleries found');
      assert.ok(galleries.includes('demo'), 'Demo gallery found');
    } catch (error) {
      assert.fail(error);
    }

    assert.end();
  });
});
