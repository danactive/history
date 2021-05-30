const hapi = require('@hapi/hapi');
const hapiReactViews = require('hapi-react-views');
const joi = require('@hapi/joi');
const path = require('path');
const querystring = require('querystring');

const config = require('../../../config.json');

const { apiPort: port } = config;

function execHapi({
  describe, plugins, routeStem, testCases,
}) {
  testCases.cases.forEach((testCase) => {
    describe.test(testCase.name, testCase.options, async (assert) => {
      const server = hapi.Server({ port });
      server.validator(joi);

      const url = `${routeStem}?${querystring.stringify(testCase.request)}`;
      const request = {
        method: 'GET',
        url,
      };

      const viewsConfig = {
        engines: {
          jsx: hapiReactViews,
        },
        relativeTo: path.join(__dirname, '../../../../'),
      };

      try {
        await server.register(plugins);

        if (server.views) {
          server.views(viewsConfig);
        }

        const response = await server.inject(request);
        if (response.result.error) {
          testCase.error(assert, response.result, { rest: true });
          return;
        }

        if (testCase.success) {
          testCase.success(assert, response.result, { rest: true });
          return;
        }

        testCase.successView(assert, response.result);
      } catch (error) {
        assert.fail(error);
        assert.end();
      }
    });
  });
}

module.exports = { execHapi };
