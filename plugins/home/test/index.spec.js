const tape = require('tape-catch');

tape('Verify / route', { skip: false }, (describe) => {
  const hapi = require('hapi');
  const hapiReactViews = require('hapi-react-views');
  const inert = require('inert');
  const path = require('path');
  const vision = require('vision');

  require('babel-core/register')({
    presets: ['react', 'es2015'],
  });

  const lib = require('../lib');
  const utils = require('../../utils/lib');

  const plugins = [inert, vision, lib];
  const port = utils.config.get('port');

  describe.test('* Valid React.js view', { skip: false }, (assert) => {
    const server = new hapi.Server();
    server.connection({ port });
    server.register(plugins, (pluginError) => {
      if (pluginError) {
        return assert.fail(pluginError);
      }

      const url = '/';
      const request = {
        method: 'GET',
        url,
      };

      server.views({
        engines: {
          jsx: hapiReactViews,
        },
        relativeTo: path.join(__dirname, '../../../'),
      });

      return server.inject(request, (response) => {
        assert.ok(response.result.indexOf('<a href="static/gallery-demo/xml/gallery.xml">demo</a>') > -1, 'Link to demo gallery');

        assert.end();
      });
    });
  });
});
