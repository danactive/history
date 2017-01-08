const tape = require('tape-catch');

tape('Index', { skip: false }, (describe) => {
  const path = require('path');

  const lib = require('../lib/exists');

  describe.test('* Real relative file exists', (assert) => {
    const testPath = './plugins/exists/test/fixtures/exists.txt';

    lib.pathExists(testPath)
      .then(() => {
        assert.pass('Resolved promise is returned');
        assert.end();
      })
      .catch((error) => {
        assert.fail(error);
        assert.end();
      });
  });

  describe.test('* Real relative folder exists', (assert) => {
    const testPath = './plugins/exists/test/fixtures';

    lib.pathExists(testPath)
      .then(() => {
        assert.pass('Resolved promise is returned');
        assert.end();
      })
      .catch((error) => {
        assert.fail(error);
        assert.end();
      });
  });

  describe.test('* Real absolute file exists', (assert) => {
    const testPath = path.join(__dirname, './fixtures/exists.txt');

    lib.pathExists(testPath)
      .then((verifiedPath) => {
        assert.equal(verifiedPath, testPath, 'Resolved path matches');
        assert.end();
      })
      .catch((error) => {
        assert.fail(error);
        assert.end();
      });
  });

  describe.test('* Real absolute folder exists', (assert) => {
    const testPath = path.join(__dirname, './fixtures');

    lib.pathExists(testPath)
      .then((verifiedPath) => {
        assert.equal(verifiedPath, testPath, 'Resolved path matches');
        assert.end();
      })
      .catch((error) => {
        assert.fail(error);
        assert.end();
      });
  });

  describe.test('* Fake absolute path does not exists', (assert) => {
    const testPath = path.join(__dirname, './fixtures/fakeFolder');

    lib.pathExists(testPath)
      .then(() => {
        assert.fail(`File system found a fake folder (${testPath})`);
        assert.end();
      })
      .catch((error) => {
        assert.equal(error.isBoom, true, 'Rejected promise is a boom error');
        assert.end();
      });
  });
});
