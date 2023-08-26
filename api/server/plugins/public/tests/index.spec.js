const tape = require('tape-catch');

tape('Public Index', { skip: false }, (describe) => {
  const hapi = require('@hapi/hapi');
  const joi = require('joi');
  const inert = require('@hapi/inert');

  const lib = require('../lib');
  const utils = require('../../utils');

  const plugins = [inert, lib];
  const port = utils.config.get('apiPort');

  describe.test('* Validate Gallery XML static asset route', async (assert) => {
    const server = hapi.Server({ port });
    server.validator(joi);
    server.path('../../public');

    const request = {
      method: 'GET',
      url: '/galleries/demo/gallery.xml',
    };

    try {
      await server.register(plugins);
      const response = await server.inject(request);
      console.log('#####', response.headers['content-type']);
      assert.equal(response.statusCode, 200);
      assert.ok(response.headers['content-type'].includes('text/xml'), 'Content-type is XML');
    } catch (error) {
      assert.fail(error);
    }

    assert.end();
  });
});
