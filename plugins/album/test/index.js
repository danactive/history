const tape = require('tape-catch');

tape('Verify /album route', { skip: false }, (describe) => {
  const hapi = require('hapi');
  const querystring = require('querystring');

  const lib = require('../lib');
  const testCases = require('./cases');
  const utils = require('../../utils/lib');

  const plugins = [lib];
  const port = utils.config.get('port');

  testCases.forEach((testCase) => {
    describe.test(testCase.name, testCase.options, (assert) => {
      const server = new hapi.Server();
      server.connection({ port });
      server.register(plugins, (pluginError) => {
        if (pluginError) {
          return assert.fail(pluginError);
        }

        const url = `/album?${querystring.stringify({ gallery: testCase.request.gallery, album_stem: testCase.request.album_stem })}`;
        const request = {
          method: 'GET',
          url,
        };

        return server.inject(request, (response) => {
          if (response.result.error) {
            testCase.catch(assert, response.result);
          } else {
            testCase.then(assert, response.result);
          }
        });
      });
    });
  });
});
