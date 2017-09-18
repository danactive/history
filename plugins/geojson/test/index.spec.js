const tape = require('tape-catch');

tape('GeoJSON Index', { skip: false }, (describe) => {
  const geojsonhint = require('@mapbox/geojsonhint');
  const hapi = require('hapi');

  const lib = require('../lib');
  const utils = require('../../utils/lib');

  const plugins = [lib];
  const port = utils.config.get('port');

  describe.test('* Validate GeoJSON', (assert) => {
    const server = new hapi.Server();
    server.connection({ port });
    server.register(plugins, (pluginError) => {
      if (pluginError) {
        assert.fail(pluginError);
        return;
      }

      const request = {
        method: 'GET',
        url: '/?gallery=demo&album_stem=sample'
      };

      server.inject(request, (result) => {
        assert.ok(geojsonhint.hint({}).length > 0, 'Error expected');

        assert.equal(result.statusCode, 200);
        const response = result.result;
        const error = geojsonhint.hint(response);

        assert.equal(error.length, 0, 'Validation passes');
        assert.end();
      });
    });
  });
});
