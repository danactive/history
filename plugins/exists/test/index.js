'use strict';
const test = require('tape');

test('Real relative file exists', (assert) => {
  const module = require('../lib');
  const testPath = './plugins/exists/test/fixtures/exists.txt';

  module.pathExists(testPath)
    .then(() => {
      assert.pass('Resolved promise is returned');
      assert.end();
    })
    .catch(() => {
      assert.fail(`File system is missing folder (${testPath})`);
      assert.end();
    });
});

test('Real relative folder exists', (assert) => {
  const module = require('../lib');
  const testPath = './plugins/exists/test/fixtures';

  module.pathExists(testPath)
    .then(() => {
      assert.pass('Resolved promise is returned');
      assert.end();
    })
    .catch(() => {
      assert.fail(`File system is missing folder (${testPath})`);
      assert.end();
    });
});

test('Real absolute file exists', (assert) => {
  const module = require('../lib');
  const path = require('path');
  const testPath = path.join(__dirname, './fixtures/exists.txt');

  module.pathExists(testPath)
    .then((verifiedPath) => {
      assert.equal(verifiedPath, testPath, 'Resolved path matches');
      assert.end();
    })
    .catch(() => {
      assert.fail(`File system is missing folder (${testPath})`);
      assert.end();
    });
});

test('Real absolute folder exists', (assert) => {
  const module = require('../lib');
  const path = require('path');
  const testPath = path.join(__dirname, './fixtures');

  module.pathExists(testPath)
    .then((verifiedPath) => {
      assert.equal(verifiedPath, testPath, 'Resolved path matches');
      assert.end();
    })
    .catch(() => {
      assert.fail(`File system is missing folder (${testPath})`);
      assert.end();
    });
});

test('Fake absolute path does not exists', (assert) => {
  const module = require('../lib');
  const path = require('path');
  const testPath = path.join(__dirname, './fixtures/fakeFolder');

  module.pathExists(testPath)
    .then(() => {
      assert.fail(`File system found a fake folder (${testPath})`);
      assert.end();
    })
    .catch((error) => {
      assert.equal(error.isBoom, true, 'Rejected promise is a boom error');
      assert.end();
    });
});
