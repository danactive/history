'use strict';
const test = require('tape');

test('Real relative file exists', (assert) => {
  const module = require('../lib');
  const testFolder = './plugins/exists/test/fixtures/exists.txt';

  module.folderExists(testFolder)
    .then(() => {
      assert.pass('Resolved promise is returned');
      assert.end();
    })
    .catch(() => {
      assert.fail(`File system is missing folder (${testFolder})`);
      assert.end();
    });
});

test('Real relative folder exists', (assert) => {
  const module = require('../lib');
  const testFolder = './plugins/exists/test/fixtures';

  module.folderExists(testFolder)
    .then(() => {
      assert.pass('Resolved promise is returned');
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
    .then((verifiedPath) => {
      assert.equal(verifiedPath, testFolder, 'Resolved path matches');
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
    .then((verifiedPath) => {
      assert.equal(verifiedPath, testFolder, 'Resolved path matches');
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
    .catch((error) => {
      assert.equal(error.isBoom, true, 'Rejected promise is a boom error');
      assert.end();
    });
});
