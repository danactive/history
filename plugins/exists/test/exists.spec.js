const tape = require('tape-catch');

tape('Exists: Library', { skip: false }, (describe) => {
  const path = require('path');

  const lib = require('../lib/exists');

  const successTest = (assert, testPath) => {
    lib.pathExists(testPath)
      .then((verifiedPath) => {
        const normalTestPath = path.normalize(testPath);
        assert.ok(verifiedPath.endsWith(normalTestPath), `Verified path (${verifiedPath}) matches test path (${normalTestPath})`);

        assert.end();
      })
      .catch((error) => {
        assert.fail(error);
        assert.end();
      });
  };

  function failureTest(assert, testPath) {
    lib.pathExists(testPath)
      .then(() => {
        assert.fail(`File system found a fake folder (${testPath})`);
        assert.end();
      })
      .catch((error) => {
        assert.equal(error.isBoom, true, 'Rejected promise is a boom error');
        assert.end();
      });
  }

  describe.test('* Real relative file exists', (assert) => {
    const testPath = 'test/fixtures/exists.txt';
    successTest(assert, testPath);
  });

  describe.test('* Real relative folder exists', (assert) => {
    const testPath = 'test/fixtures';
    successTest(assert, testPath);
  });

  describe.test('* Real absolute file exists', (assert) => {
    const testPath = '/test/fixtures/exists.txt';
    successTest(assert, testPath);
  });

  describe.test('* Real absolute folder exists', (assert) => {
    const testPath = '/test/fixtures';
    successTest(assert, testPath);
  });

  describe.test('* Real root absolute file exists', (assert) => {
    const testPath = path.join(__dirname, '../../../public/test/fixtures/exists.txt');
    successTest(assert, testPath);
  });

  describe.test('* Real root absolute folder exists', (assert) => {
    const testPath = path.join(__dirname, '../../../public/test/fixtures');
    successTest(assert, testPath);
  });

  describe.test('* Fake absolute path does not exists', (assert) => {
    const testPath = '/test/fixtures/fakeFolder';
    failureTest(assert, testPath);
  });
});
