const tape = require('tape-catch');

tape('Verify /walk route', { skip: false }, (describe) => {
  const Hapi = require('hapi');
  const inert = require('inert');
  const vision = require('vision');

  const lib = require('../lib');
  const testCases = require('./cases');
  const testCaseDef = require('../../../test/casesDefinition');
  const utils = require('../../utils');

  const plugins = [inert, vision, lib];
  const port = utils.config.get('port');
  const url = '/admin/walk-path';

  testCaseDef.execHapi({
    describe, plugins, testCases, url
  });

  describe.test('* Handler', async (assert) => {
    const server = new Hapi.Server();

    server.connection({ port });
    await server.register(plugins);

    const request = {
      method: 'GET',
      url: '/admin/walk-path?path=/galleries&raw=true'
    };

    const result = await server.inject(request);
    const response = result.result;

    let actual;
    let expected;


    actual = result.statusCode;
    expected = 200;
    assert.equal(actual, expected, 'HTTP status is okay');


    const gallery = response.files.find(file => (file.name === 'gallery-demo'));
    actual = gallery.filename;
    expected = 'gallery-demo';
    assert.equal(actual, expected, 'Found demo gallery');


    assert.end();
  });
});
