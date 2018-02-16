const tape = require('tape-catch');

tape('Verify /walk route', { skip: false }, (describe) => {
  const hapi = require('hapi');
  const inert = require('inert');
  const typy = require('typy');
  const vision = require('vision');

  const lib = require('../lib');
  const testCases = require('./cases');
  const testCaseDef = require('../../../../server/test/casesDefinition');
  const utils = require('../../utils');

  const plugins = [inert, vision, lib];
  const port = utils.config.get('port');
  const url = '/admin/walk-path';

  testCaseDef.execHapi({
    describe, plugins, testCases, url
  });

  describe.test('* Handler', async (assert) => {
    const server = hapi.Server({ port });

    const request = {
      method: 'GET',
      url: `${url}?path=/galleries&raw=true`
    };

    let actual;
    let expected;

    try {
      await server.register(plugins);
      const response = await server.inject(request);


      actual = response.statusCode;
      expected = 200;
      assert.equal(actual, expected, 'HTTP status is okay');


      if (!typy(response.result.files).isArray) {
        assert.fail('No response result');
        assert.end();
        return;
      }


      const gallery = response.result.files.find(file => (file.name === 'gallery-demo'));
      actual = gallery.filename;
      expected = 'gallery-demo';
      assert.equal(actual, expected, 'Found demo gallery');
    } catch (error) {
      assert.fail(error);
    }

    assert.end();
  });
});
