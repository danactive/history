'use strict';
const test = require('tape');

test('Real relative file exists', (assert) => {
  const module = require('../lib');
  const testFolder = './test/fixtures/exists.txt';

  module.folderExists(testFolder)
    .then((result) => {
      assert.equal(result.verified, true, 'Verified');
      assert.equal(result.path, testFolder, 'Path matches');
      assert.end();
    })
    .catch(() => {
      assert.fail(`File system is missing folder (${testFolder})`);
      assert.end();
    });
});

test('Real relative folder exists', (assert) => {
  const module = require('../lib');
  const testFolder = './test/fixtures';

  module.folderExists(testFolder)
    .then((result) => {
      assert.equal(result.verified, true, 'Verified');
      assert.equal(result.path, testFolder, 'Path matches');
      assert.end();
    })
    .catch(() => {
      assert.fail(`File system is missing folder (${testFolder})`);
      assert.end();
    });
});

test('Real absolute file exists', (assert) => {
  const module = require('../lib');
  const path = require('path');
  const testFolder = path.join(__dirname, './fixtures/exists.txt');

  module.folderExists(testFolder)
    .then((result) => {
      assert.equal(result.verified, true, 'Verified');
      assert.equal(result.path, testFolder, 'Path matches');
      assert.end();
    })
    .catch(() => {
      assert.fail(`File system is missing folder (${testFolder})`);
      assert.end();
    });
});

test('Real absolute folder exists', (assert) => {
  const module = require('../lib');
  const path = require('path');
  const testFolder = path.join(__dirname, './fixtures');

  module.folderExists(testFolder)
    .then((result) => {
      assert.equal(result.verified, true, 'Verified');
      assert.equal(result.path, testFolder, 'Path matches');
      assert.end();
    })
    .catch(() => {
      assert.fail(`File system is missing folder (${testFolder})`);
      assert.end();
    });
});

test('Fake absolute path does not exists', (assert) => {
  const module = require('../lib');
  const path = require('path');
  const testFolder = path.join(__dirname, './fixtures/fakeFolder');

  module.folderExists(testFolder)
    .then(() => {
      assert.fail(`File system found a fake folder (${testFolder})`);
      assert.end();
    })
    .catch((result) => {
      assert.equal(result.verified, false, 'Verified');
      assert.equal(result.path, testFolder, 'Path matches');
      assert.end();
    });
});
