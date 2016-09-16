const tape = require('tape-catch');

tape('Verify /rename route', { skip: false }, (describe) => {
  const hapi = require('hapi');

  const lib = require('../lib');
  const libRename = require('../lib/rename');

  const plugins = [lib];
  const prefix = '2016-10-16';

  describe.test('* Caught fake source folder', (assert) => {
    const server = new hapi.Server();
    server.connection({ port: 8000 });
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
          source_folder: './plugins/rename/test/fixtures/renameable/FAKE',
        },
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
    server.connection({ port: 8000 });
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
          source_folder: './plugins/rename/test/fixtures/renameable',
        },
      };

      server.inject(request, (response) => {
        assert.equal(response.result.xml, `<photo id="1"><filename>${prefix}-37.jpg</filename></photo>` +
          `<photo id="2"><filename>${prefix}-64.jpg</filename></photo>` +
          `<photo id="3"><filename>${prefix}-90.jpg</filename></photo>`, 'XML response is expected');
        assert.equal(response.statusCode, 200, 'HTTP status okay');
        assert.end();
      });

      return assert.pass('No error');
    });
  });

  describe.test('* Restore filenames to original', { timeout: 1100 }, (assert) => {
    const filenames = [`${prefix}-37.jpg`, `${prefix}-64.jpg`, `${prefix}-90.jpg`];
    const futureFilenames = ['aitch.html', 'gee.gif', 'em.md'];
    const sourceFolder = './plugins/rename/test/fixtures/renameable';

    libRename.renamePaths(sourceFolder, filenames, futureFilenames)
      .then((result) => {
        assert.equal(result, true, 'No errors');
        assert.end();
      })
      .catch((error) => {
        assert.fail(`Rename failed ${error}`);
        assert.end();
      });
  });

  describe.test('* Rename filename based on prefix with associated files', (assert) => {
    const server = new hapi.Server();
    server.connection({ port: 8000 });
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
          rename_associated: true,
        },
      };

      server.inject(request, (response) => {
        assert.equal(response.result.xml, `<photo id="1"><filename>${prefix}-50.jpg</filename></photo>` +
          `<photo id="2"><filename>${prefix}-90.jpg</filename></photo>`, 'XML response is expected');
        assert.equal(response.statusCode, 200, 'HTTP status okay');
        assert.end();
      });

      return assert.pass('No error');
    });
  });

  describe.test('* Restore filenames to original with associated files', (assert) => {
    setTimeout(() => {
      const filenames = [`${prefix}-50.dat`, `${prefix}-50.doc`, `${prefix}-50.docx`, `${prefix}-90.pdf`, `${prefix}-90.png`, `${prefix}-90.psd`];
      const futureFilenames = ['dee.dat', 'dee.doc', 'dee.docx', 'pee.pdf', 'pee.png', 'pee.psd'];
      const sourceFolder = './plugins/rename/test/fixtures/renameable';

      libRename.renamePaths(sourceFolder, filenames, futureFilenames)
        .then((result) => {
          assert.equal(result, true, 'No errors');
          assert.end();
        })
        .catch((error) => {
          assert.fail(`Rename failed ${error}`);
          assert.end();
        });
    }, 1100);
  });
});
