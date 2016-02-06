'use strict';
const test = require('tape');

test('Verify /rename route', (assert) => {
  const plugins = [require('../lib')];
  const hapi = require('hapi');
  const prefix = '2016-04-05';

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
          filenames: ['cee.css', 'jay.js', 'tee.txt'],
          prefix,
          source_folder: '../../test/fixtures/renameable',
        },
      };
      server.inject(request, (response) => {
        st.equal(response.result, `<photo id="1"><filename>${prefix}-37.jpg</filename></photo>` +
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
      const futureFilenames = ['cee.css', 'jay.js', 'tee.txt'];
      const sourceFolder = '../../test/fixtures/renameable';
      const module = require('../lib/rename');

      module.renamePaths(sourceFolder, filenames, futureFilenames)
        .then((result) => {
          st.equal(result, true, 'No errors');
          st.end();
        })
        .catch(() => {
          st.fail('Rename failed');
          st.end();
        });
    }, 1000);
  });
});
