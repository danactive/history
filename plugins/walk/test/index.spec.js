const tape = require('tape-catch');

tape('Verify /walk route', { skip: false }, (describe) => {
  const hapi = require('hapi');
  const querystring = require('querystring');

  const lib = require('../lib');
  const testCases = require('./cases');
  const utils = require('../../utils/lib');

  const plugins = [lib];
  const port = utils.config.get('port');

  testCases.cases.forEach((testCase) => {
    describe.test(testCase.name, testCase.options, (assert) => {
      const server = new hapi.Server();
      server.connection({ port });
      server.register(plugins, (pluginError) => {
        if (pluginError) {
          assert.fail(pluginError);
          return;
        }

        const url = `/admin/walk-path?raw=true&${querystring.stringify({ path: testCase.request.path })}`;
        const request = {
          method: 'GET',
          url,
        };


        server.inject(request, (response) => {
          if (response.result.error) {
            return testCase.error(assert, response.result, { rest: true });
          }

          if (testCase.success) {
            return testCase.success(assert, response.result, { rest: true });
          }

          return testCase.successView(assert, response.result);
        });
      });
    });
  });
});
