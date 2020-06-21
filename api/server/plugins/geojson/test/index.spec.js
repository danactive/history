const tape = require('tape-catch');

tape('GeoJSON Index', { skip: false }, (describe) => {
  const geojsonhint = require('@mapbox/geojsonhint');
  const hapi = require('@hapi/hapi');
  const joi = require('@hapi/joi');

  const lib = require('../lib');
  const utils = require('../../utils');

  const plugins = [lib];
  const port = utils.config.get('apiPort');

  describe.test('* Validate GeoJSON', async (assert) => {
    const server = hapi.Server({ port });
    server.validator(joi);

    const request = {
      method: 'GET',
      url: '/?gallery=demo&album_stem=sample',
    };

    try {
      await server.register(plugins);
      const response = await server.inject(request);

      assert.ok(geojsonhint.hint({}).length > 0, 'Error expected');

      assert.equal(response.statusCode, 200);
      const error = geojsonhint.hint(response.result);

      assert.equal(error.length, 0, 'Validation passes');
    } catch (error) {
      assert.fail(error);
    }

    assert.end();
  });
});
