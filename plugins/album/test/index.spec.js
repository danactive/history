const test = require('tape-catch');

test('Verify /album route', { skip: false }, (describe) => {
  const hapi = require('hapi');
  const hapiReactViews = require('hapi-react-views');
  const inert = require('inert');
  const querystring = require('querystring');
  const path = require('path');
  const vision = require('vision');

  const lib = require('../lib');
  const testCases = require('./cases');
  const testCaseDef = require('../../../test/casesDefinition');

  const SAMPLE_IMAGE_COUNT = 6;
  const plugins = [inert, vision, lib];

  testCaseDef.execHapi({ describe, plugins, testCases, routeStem: '/album' });

  describe.test('* JavaScript library requirements', { skip: false }, (assert) => {
    const server = new hapi.Server();
    server.connection();
    server.register(plugins, (pluginError) => {
      if (pluginError) {
        return assert.fail(pluginError);
      }

      const url = `/album?${querystring.stringify({ gallery: 'demo', album_stem: 'sample' })}`;
      const request = {
        method: 'GET',
        url
      };

      server.views({
        engines: {
          jsx: hapiReactViews
        },
        relativeTo: path.join(__dirname, '../../../')
      });

      return server.inject(request, (response) => {
        const thumbDivs = response.result.split('<div class="albumBoxPhotoImg">').length;
        const thumbLinks = response.result.split('<div class="albumBoxPhotoImg"><a href=').length;
        assert.equal(thumbDivs, SAMPLE_IMAGE_COUNT, 'HTML thumb divs match images in sample album');
        assert.equal(thumbDivs, thumbLinks, 'ColorBox requirement href found');

        assert.end();
      });
    });
  });
});
