const tape = require('tape-catch');

tape('Verify / route', { skip: false }, (describe) => {
  const hapi = require('hapi');
  const hapiReactViews = require('hapi-react-views');
  const inert = require('inert');
  const path = require('path');
  const querystring = require('querystring');
  const vision = require('vision');

  const config = require('../../../../config.json');
  const lib = require('../lib');
  const utils = require('../../utils');

  const plugins = [inert, vision, lib];
  const port = utils.config.get('port');

  describe.test('* Verify / route', { skip: false }, async (assert) => {
    const server = hapi.Server({ port });

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
