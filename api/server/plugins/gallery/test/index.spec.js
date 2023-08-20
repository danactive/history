const tape = require('tape-catch');

tape('Gallery Index', { skip: false }, (describe) => {
  const hapi = require('@hapi/hapi');
  const joi = require('@hapi/joi');
  const path = require('path');
  const inert = require('@hapi/inert');

  const lib = require('../lib');
  const utils = require('../../utils');

  const plugins = [inert, lib];
  const port = utils.config.get('apiPort');

  describe.test('* Validate Gallery List route', async (assert) => {
    const relativeTo = path.join(__dirname, '../../../../../', 'public');
    const server = hapi.Server({ port });
    server.validator(joi);
    server.path(relativeTo);

    const request = {
      method: 'GET',
      url: '/galleryList',
    };

    try {
      await server.register(plugins);
      const response = await server.inject(request);

      assert.equal(response.statusCode, 200);
      assert.ok(response.result.galleries.includes('demo'), 'Demo gallery hosted on local');
    } catch (error) {
      assert.fail(error);
    }

    assert.end();
  });
});
