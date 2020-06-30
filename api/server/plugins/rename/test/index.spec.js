const tape = require('tape-catch');

tape('Verify /rename route', { skip: false }, (describe) => {
  const hapi = require('@hapi/hapi');
  const joi = require('@hapi/joi');
  const path = require('path');

  const lib = require('../lib');
  const libRename = require('../lib/rename');
  const utils = require('../../utils');

  const plugins = [lib];
  const prefix = '2016-10-16';
  const port = utils.config.get('apiPort');

  describe.test('* Caught fake source folder', async (assert) => {
    const server = hapi.Server({ port });
    server.validator(joi);
    await server.register(plugins);

    const request = {
      method: 'POST',
      url: '/rename',
      payload: {
        filenames: ['aitch.html', 'gee.gif', 'em.md'],
        prefix,
        source_folder: '/test/fixtures/renameable/FAKE',
      },
    };

    try {
      const response = await server.inject(request);

      assert.equal(response.statusCode, 404, 'Status code');
    } catch (error) {
      assert.fail(error);
    }

    assert.end();
  });

  describe.test('* Rename filename based on prefix', async (assert) => {
    const server = hapi.Server({ port });
    server.validator(joi);

    const request = {
      method: 'POST',
      url: '/rename',
      payload: {
        filenames: ['aitch.html', 'gee.gif', 'em.md'],
        prefix,
        raw: true,
        source_folder: '/test/fixtures/renameable',
      },
    };

    try {
      await server.register(plugins);
      const response = await server.inject(request);

      let actual;
      let expected;

      actual = response.statusCode;
      expected = 200;
      assert.equal(actual, expected, 'HTTP status okay');

      actual = response.result.message;
      expected = undefined;
      assert.equal(actual, expected, 'No response error');

      actual = response.result.xml;
      expected = `<item id="100"><filename>${prefix}-37.jpg</filename></item>`
        + `<item id="101"><filename>${prefix}-64.jpg</filename></item>`
        + `<item id="102"><filename>${prefix}-90.jpg</filename></item>`;
      assert.equal(actual, expected, 'XML response is expected');

      const filenames = [`${prefix}-37.jpg`, `${prefix}-64.jpg`, `${prefix}-90.jpg`];
      const futureFilenames = ['aitch.html', 'gee.gif', 'em.md'];
      const sourceFolder = '/test/fixtures/renameable';

      const result = await libRename.renamePaths(sourceFolder, filenames, futureFilenames);
      const uniqueResult = new Set(result);

      futureFilenames.forEach((filename) => {
        const fullPath = utils.file.safePublicPath(path.join(sourceFolder, filename));
        assert.ok(uniqueResult.has(fullPath), `Full path matches future path (${fullPath})`);
      });
    } catch (error) {
      assert.fail(error);
    }

    assert.end();
  });

  describe.test('* Rename filename based on prefix with associated files', async (assert) => {
    const server = hapi.Server({ port });
    server.validator(joi);

    const request = {
      method: 'POST',
      url: '/rename',
      payload: {
        filenames: ['dee.dat', 'pee.pdf'],
        prefix,
        raw: true,
        rename_associated: true,
        source_folder: '/test/fixtures/renameable',
      },
    };

    try {
      await server.register(plugins);
      const response = await server.inject(request);

      let actual;
      let expected;

      actual = response.statusCode;
      expected = 200;
      assert.equal(actual, expected, 'HTTP status');

      actual = response.statusMessage;
      expected = 'OK';
      assert.equal(actual, expected, 'HTTP status message');

      actual = response.result.message;
      expected = undefined;
      assert.equal(actual, expected, 'No response error');

      actual = response.result.xml;
      expected = `<item id="100"><filename>${prefix}-50.jpg</filename></item><item id="101"><filename>${prefix}-90.jpg</filename></item>`;
      assert.equal(actual, expected, 'XML response is expected');

      const filenames = [`${prefix}-50.dat`, `${prefix}-50.doc`, `${prefix}-50.docx`, `${prefix}-90.pdf`, `${prefix}-90.png`, `${prefix}-90.psd`];
      const futureFilenames = ['dee.dat', 'dee.doc', 'dee.docx', 'pee.pdf', 'pee.png', 'pee.psd'];
      const sourceFolder = '/test/fixtures/renameable';

      const result = await libRename.renamePaths(sourceFolder, filenames, futureFilenames);
      const uniqueResult = new Set(result);

      futureFilenames.forEach((filename) => {
        const publicPath = utils.file.safePublicPath(path.join(sourceFolder, filename));
        assert.ok(uniqueResult.has(publicPath), `Public path matches future path (${publicPath})`);
      });
    } catch (error) {
      assert.fail(error);
    }

    assert.end();
  });
});
