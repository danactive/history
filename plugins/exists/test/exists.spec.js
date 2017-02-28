const tape = require('tape-catch');

tape('Index', { skip: false }, (describe) => {
  const path = require('path');

  const lib = require('../lib/exists');

  const successTest = (assert, testPath, isAbsoluteCheck) => {
    lib.pathExists(testPath)
      .then((verifiedPath) => {
        if (isAbsoluteCheck === true) {
          assert.equal(verifiedPath, testPath, 'Resolved path matches');
        }
        assert.pass('Resolved promise is returned');
        assert.end();
      })
      .catch((error) => {
        assert.fail(error);
        assert.end();
      });
  };

  describe.test('* Real relative file exists', (assert) => {
    const testPath = './plugins/exists/test/fixtures/exists.txt';
    successTest(assert, testPath, false);
  });

  describe.test('* Real relative folder exists', (assert) => {
    const testPath = './plugins/exists/test/fixtures';
    successTest(assert, testPath, false);
  });

  describe.test('* Real absolute file exists', (assert) => {
    const testPath = path.join(__dirname, './fixtures/exists.txt');
    successTest(assert, testPath, true);
  });

  describe.test('* Real absolute folder exists', (assert) => {
    const testPath = path.join(__dirname, './fixtures');
    successTest(assert, testPath, true);
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
