const tape = require('tape-catch');

tape('Gallery Index', { skip: false }, (describe) => {
  const hapi = require('hapi');
  const path = require('path');
  const inert = require('inert');

  const lib = require('../lib');
  const utils = require('../../utils');

  const plugins = [inert, lib];
  const port = utils.config.get('port');

  describe.test('* Validate Gallery route', async (assert) => {
    const relativeTo = path.join(__dirname, '../../../../', 'public');
    const server = hapi.Server({ port });
    server.path(relativeTo);

      const request = {
        method: 'GET',
        url: '/static/gallery-demo/xml/gallery.xml'
      };

    try {
      await server.register(plugins);
      const response = await server.inject(request);

      assert.equal(response.statusCode, 200);
      assert.ok(response.headers['content-type'].includes('text/xml'), 'Content-type is XML');
    } catch (error) {
      assert.fail(error);
    }

        assert.end();
      });
    });
