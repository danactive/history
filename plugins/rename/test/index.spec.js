const tape = require('tape-catch');

tape('Verify /rename route', { skip: false }, (describe) => {
  const hapi = require('hapi');
  const path = require('path');

  const lib = require('../lib');
  const libRename = require('../lib/rename');
  const utils = require('../../utils/lib');

  const TIMEOUT = 1100;

  const plugins = [lib];
  const prefix = '2016-10-16';
  const port = utils.config.get('port');

  describe.test('* Caught fake source folder', (assert) => {
    const server = new hapi.Server();
    server.connection({ port });
    server.register(plugins, (error) => {
      if (error) {
        return assert.fail(error);
      }

      const request = {
        method: 'POST',
        url: '/rename',
        payload: {
          filenames: ['aitch.html', 'gee.gif', 'em.md'],
          prefix,
          source_folder: './plugins/rename/test/fixtures/renameable/FAKE'
        }
      };

      server.inject(request, (result) => {
        assert.equal(result.statusCode, 404);
        assert.end();
      });

      return undefined;
    });
  });

  describe.test('* Rename filename based on prefix', (assert) => {
    const server = new hapi.Server();
    server.connection({ port });
    server.register(plugins, (error) => {
      if (error) {
        return assert.fail(error);
      }

      assert.plan(2);
      const request = {
        method: 'POST',
        url: '/rename',
        payload: {
          filenames: ['aitch.html', 'gee.gif', 'em.md'],
          prefix,
          source_folder: './plugins/rename/test/fixtures/renameable'
        }
      };

      return server.inject(request, (response) => {
        assert.equal(response.statusCode, 200, 'HTTP status okay');
        assert.equal(response.result.xml, `<item id="100"><filename>${prefix}-37.jpg</filename></item>` +
          `<item id="101"><filename>${prefix}-64.jpg</filename></item>` +
          `<item id="102"><filename>${prefix}-90.jpg</filename></item>`, 'XML response is expected');
      });
    });
  });

  describe.test('* Restore filenames to original', { timeout: TIMEOUT }, (assert) => {
    const filenames = [`${prefix}-37.jpg`, `${prefix}-64.jpg`, `${prefix}-90.jpg`];
    const futureFilenames = ['aitch.html', 'gee.gif', 'em.md'];
    const sourceFolder = './plugins/rename/test/fixtures/renameable';

    libRename.renamePaths(sourceFolder, filenames, futureFilenames)
      .then((result) => {
        assert.plan(result.length);
        const uniqueResult = new Set(result);
        futureFilenames.forEach((filename) => {
          const fullPath = path.resolve(__dirname, '../../../', sourceFolder, filename);
          assert.ok(uniqueResult.has(fullPath), 'Full path matches future path');
        });
      })
      .catch((error) => {
        assert.fail(`Rename failed ${error}`);
        assert.end();
      });
  });

  describe.test('* Rename filename based on prefix with associated files', (assert) => {
    const server = new hapi.Server();
    server.connection({ port });
    server.register(plugins, (error) => {
      if (error) {
        assert.fail(`Plugin failed due to ${error}`);
        return assert.end();
      }

      const request = {
        method: 'POST',
        url: '/rename',
        payload: {
          filenames: ['dee.dat', 'pee.pdf'],
          prefix,
          source_folder: './plugins/rename/test/fixtures/renameable',
          rename_associated: true
        }
      };

      server.inject(request, (response) => {
        assert.equal(response.statusCode, 200, 'HTTP status okay');
        assert.equal(response.result.xml, `<item id="100"><filename>${prefix}-50.jpg</filename></item>` +
          `<item id="101"><filename>${prefix}-90.jpg</filename></item>`, 'XML response is expected');
        assert.end();
      });

      return assert.pass('No error');
    });
  });

  describe.test('* Restore filenames to original with associated files', { timeout: TIMEOUT }, (assert) => {
    const filenames = [`${prefix}-50.dat`, `${prefix}-50.doc`, `${prefix}-50.docx`, `${prefix}-90.pdf`, `${prefix}-90.png`, `${prefix}-90.psd`];
    const futureFilenames = ['dee.dat', 'dee.doc', 'dee.docx', 'pee.pdf', 'pee.png', 'pee.psd'];
    const sourceFolder = './plugins/rename/test/fixtures/renameable';

    libRename.renamePaths(sourceFolder, filenames, futureFilenames)
      .then((result) => {
        assert.plan(result.length);
        const uniqueResult = new Set(result);
        futureFilenames.forEach((filename) => {
          const fullPath = path.resolve(__dirname, '../../../', sourceFolder, filename);
          assert.ok(uniqueResult.has(fullPath), 'Full path matches future path');
        });
      })
      .catch((error) => {
        assert.fail(`Rename failed ${error}`);
        assert.end();
      });
  });
});
