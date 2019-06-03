const tape = require('tape-catch');

tape('Verify /video route', { skip: false }, (describe) => {
  const hapi = require('@hapi/hapi');
  const hapiReactViews = require('hapi-react-views');
  const inert = require('inert');
  const path = require('path');
  const querystring = require('querystring');
  const { t: typy } = require('typy');
  const vision = require('vision');

  const lib = require('../lib');
  const utils = require('../../utils');

  const plugins = [inert, vision, lib];
  const port = utils.config.get('port');

  describe.test('* Valid React.js view', { skip: false }, async (assert) => {
    const server = hapi.Server({ port });
    const sources = '2012-fireplace.mp4,2012-fireplace.webm';

    const url = `/video?${querystring.stringify({
      gallery: 'demo',
      w: 1280,
      h: 720,
      raw: true,
      sources,
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


      if (!typy(response.result.video.sources).isString) {
        assert.fail('No response result');
        assert.end();
        return;
      }


      actual = response.result.video.sources.split(',').length;
      expected = 2;
      assert.equal(actual, expected, 'Source elements count');
    } catch (error) {
      assert.fail(error);
    }

    assert.end();
  });
});
