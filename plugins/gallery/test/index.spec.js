const tape = require('tape-catch');

tape('Gallery Index', { skip: false }, (describe) => {
  const Hapi = require('hapi');
  const path = require('path');
  const inert = require('inert');

  const lib = require('../lib');
  const utils = require('../../utils/lib');

  const plugins = [inert, lib];
  const port = utils.config.get('port');

  describe.test('* Validate Gallery route', (assert) => {
    const server = new Hapi.Server({
      connections: {
        routes: {
          files: {
            relativeTo: path.join(__dirname, '../../../', 'public'),
          },
        },
      },
    });
    server.connection({ port });
    server.register(plugins, (pluginError) => {
      if (pluginError) {
        assert.fail(pluginError);
        return;
      }

      const request = {
        method: 'GET',
        url: '/static/gallery-demo/xml/gallery.xml',
      };

      server.inject(request, (result) => {
        assert.equal(result.statusCode, 200);
        assert.ok(result.headers['content-type'].includes('text/xml'), 'Content-type is XML');
        assert.end();
      });
    });
  });
});
