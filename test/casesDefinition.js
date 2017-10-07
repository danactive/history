const hapi = require('hapi');
const hapiReactViews = require('hapi-react-views');
const path = require('path');
const querystring = require('querystring');

function execHapi({
  describe, plugins, routeStem, testCases
}) {
  testCases.cases.forEach((testCase) => {
    describe.test(testCase.name, testCase.options, (assert) => {
      const server = new hapi.Server();
      server.connection();
      server.register(plugins, (pluginError) => {
        if (pluginError) {
          assert.fail(pluginError);
          return;
        }

        const url = `${routeStem}?${querystring.stringify(testCase.request)}`;
        const request = {
          method: 'GET',
          url
        };

        if (server.views) {
          server.views({
            engines: {
              jsx: hapiReactViews
            },
            relativeTo: path.join(__dirname, '../')
          });
        }

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
}

module.exports = { execHapi };
