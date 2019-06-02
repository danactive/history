const test = require('tape-catch');

test('Verify /view/album route', { skip: false }, (describe) => {
  const hapi = require('hapi');
  const hapiReactViews = require('hapi-react-views');
  const inert = require('inert');
  const querystring = require('querystring');
  const path = require('path');
  const vision = require('vision');

  const config = require('../../../../../config.json');
  const lib = require('../lib');
  const testCases = require('./cases');
  const testCaseDef = require('../../../test/casesDefinition');

  const SAMPLE_IMAGE_COUNT = 5;
  const plugins = [inert, vision, lib];

  testCaseDef.execHapi({
    describe, plugins, testCases, routeStem: '/album',
  });

  describe.test('* JavaScript library requirements', { skip: false }, async (assert) => {
    const server = hapi.Server();

    const url = `/album?${querystring.stringify({
      album_stem: config.defaultAlbum,
      gallery: config.defaultGallery,
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

      const actual = response.result.album.items.length;
      const expected = SAMPLE_IMAGE_COUNT;
      assert.equal(actual, expected, 'Photo count');
    } catch (error) {
      assert.fail(error);
    }

    assert.end();
  });
});
