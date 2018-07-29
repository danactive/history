const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const utils = require('../../utils');

const cases = [];
const fsAccess = promisify(fs.access);

cases.push({
  name: '* Find galleries folder',
  options: { skip: false },
  request: { raw: true },
  success: ({ assert, response }) => {
    let assertionEnded = false;
    response.files.forEach((file) => {
      if (file.name === 'galleries') {
        assertionEnded = true;
        assert.pass('Galleries found');
      }
    });

    if (assertionEnded) {
      assert.end();
      return;
    }

    assert.fail('Demo gallery not found');
    assert.end();
  },
  error: (assert, error) => {
    assert.ok(error, 'Caught expected error');
    assert.end();
  },
});

cases.push({
  name: '* Public test path',
  options: { skip: false },
  request: { path: 'test/fixtures/walkable', raw: true },
  success: ({ assert, response }) => {
    let assertionEnded = false;
    let matchCount = 0;
    response.files.forEach((file) => {
      if (file.name === 'jay' || file.name === 'tee') {
        assertionEnded = true;
        matchCount += 1;
        assert.pass(`Found an expected file (${file.name})`);
      }
    });

    if (assertionEnded && matchCount === 2) {
      assert.pass('All fixtures found');
      assert.end();
      return;
    }

    assert.fail('All fixtures not found');
    assert.end();
  },
  error: (assert, error) => {
    assert.ok(error, 'Caught expected error');
    assert.end();
  },
});

cases.push({
  name: '* All filenames must exist',
  options: { skip: false },
  request: { path: 'test/fixtures/walkable', raw: true },
  success: async ({ assert, request, response }) => {
    const publicPath = await utils.file.safePublicPath('/');

    await response.files.forEach(async (file) => {
      try {
        const filenamePath = path.join(publicPath, request.path, file.filename);
        const options = fs.constants.R_OK | fs.constants.W_OK; // eslint-disable-line no-bitwise
        const existsError = await fsAccess(filenamePath, options);
        assert.notOk(existsError, `Exists ${file.filename}`);
      } catch (error) {
        assert.fail(error.message);
      }
    });

    assert.end();
  },
  error: (assert, error) => {
    assert.ok(error, 'Caught expected error');
    assert.end();
  },
});

module.exports = { cases };
