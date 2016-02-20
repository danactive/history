'use strict';
const test = require('tape');

test('Verify /rename route', (assert) => {
  const plugins = [require('../lib')];
  const hapi = require('hapi');
  const prefix = '2016-04-05';

  assert.test('-Caught fake source folder', (st) => {
    const server = new hapi.Server();
    server.connection({ port: 8000 });
    server.register(plugins, (error) => {
      if (error) {
        return st.fail(error);
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
        st.equal(result.statusCode, 404);
        st.end();
      });
    });
  });

  assert.test('-Rename filename based on prefix', (st) => {
    const server = new hapi.Server();
    server.connection({ port: 8000 });
    server.register(plugins, (error) => {
      if (error) {
        return st.fail(error);
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
        st.equal(response.result.xml, `<photo id="1"><filename>${prefix}-37.jpg</filename></photo>` +
          `<photo id="2"><filename>${prefix}-64.jpg</filename></photo>` +
          `<photo id="3"><filename>${prefix}-90.jpg</filename></photo>`);
        st.equal(response.statusCode, 200);
        st.end();
      });
    });
  });

  assert.test('-Restore filenames to original', (st) => {
    setTimeout(() => {
      const filenames = [`${prefix}-37.jpg`, `${prefix}-64.jpg`, `${prefix}-90.jpg`];
      const futureFilenames = ['aitch.html', 'gee.gif', 'em.md'];
      const sourceFolder = './plugins/rename/test/fixtures/renameable';
      const module = require('../lib/rename');

      module.renamePaths(sourceFolder, filenames, futureFilenames)
        .then((result) => {
          st.equal(result, true, 'No errors');
          st.end();
        })
        .catch((error) => {
          st.fail(`Rename failed ${error}`);
          st.end();
        });
    }, 1100);
  });

  assert.test('-Rename filename based on prefix with associated files', (st) => {
    const server = new hapi.Server();
    server.connection({ port: 8000 });
    server.register(plugins, (error) => {
      if (error) {
        return st.fail(error);
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
        st.equal(response.result.xml, `<photo id="1"><filename>${prefix}-50.jpg</filename></photo>` +
          `<photo id="2"><filename>${prefix}-90.jpg</filename></photo>`);
        st.equal(response.statusCode, 200);
        st.end();
      });
    });
  });

  assert.test('-Restore filenames to original with associated files', (st) => {
    setTimeout(() => {
      const filenames = [`${prefix}-50.dat`, `${prefix}-50.doc`, `${prefix}-50.docx`, `${prefix}-90.pdf`, `${prefix}-90.png`, `${prefix}-90.psd`];
      const futureFilenames = ['dee.dat', 'dee.doc', 'dee.docx', 'pee.pdf', 'pee.png', 'pee.psd'];
      const sourceFolder = './plugins/rename/test/fixtures/renameable';
      const module = require('../lib/rename');

      module.renamePaths(sourceFolder, filenames, futureFilenames)
        .then((result) => {
          st.equal(result, true, 'No errors');
          st.end();
        })
        .catch((error) => {
          st.fail(`Rename failed ${error}`);
          st.end();
        });
    }, 1100);
  });
});
