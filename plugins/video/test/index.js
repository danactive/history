const tape = require('tape-catch');

tape('Verify /video route', { skip: false }, (describe) => {
  const hapi = require('hapi');
  const hapiReactViews = require('hapi-react-views');
  const inert = require('inert');
  const querystring = require('querystring');
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

      const sources = '2012-fireplace.mp4,2012-fireplace.webm';
      const url = `/video?${querystring.stringify({
        gallery: 'demo',
        sources,
        w: 1280,
        h: 720,
      })}`;
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
        assert.ok(response.result.indexOf('<video controls=""') > -1, 'Video controls');
        assert.ok(response.result.indexOf('><source src=') > -1, 'Source element');
        assert.equal((response.result.match(/><source src="/g) || []).length, sources.split(',').length, 'Source elements count');

        assert.end();
      });
    });
  });
});
