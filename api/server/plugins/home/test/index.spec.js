const tape = require('tape-catch');

tape('Verify home / route', { skip: false }, (describe) => {
  const hapi = require('@hapi/hapi');
  const hapiReactViews = require('hapi-react-views');
  const joi = require('@hapi/joi');
  const inert = require('@hapi/inert');
  const path = require('path');
  const querystring = require('querystring');
  const vision = require('@hapi/vision');

  const config = require('../../../../../config.json');
  const lib = require('../lib');
  const utils = require('../../utils');

  const plugins = [inert, vision, lib];
  const port = utils.config.get('apiPort');

  describe.test('* Check home response', { skip: false }, async (assert) => {
    const server = hapi.Server({ port });
    server.validator(joi);

    const url = `/?${querystring.stringify({
      raw: true,
    })}`;

    const viewsConfig = {
      engines: {
        jsx: hapiReactViews,
      },
      relativeTo: path.join(__dirname, '../../../'),
    };

    const request = {
      method: 'GET',
      url,
    };

    try {
      await server.register(plugins);
      server.views(viewsConfig);
      const response = await server.inject(request);


      let actual;
      let expected;


      actual = response.statusCode;
      expected = 200;
      assert.equal(actual, expected, 'HTTP status is okay');


      actual = response.result.galleries.includes(config.defaultGallery);
      expected = true;
      assert.equal(actual, expected, 'Default gallery found');
    } catch (error) {
      assert.fail(error);
    }

    assert.end();
  });
});
