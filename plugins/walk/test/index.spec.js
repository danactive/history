const tape = require('tape-catch');

tape('Verify /walk route', { skip: false }, (describe) => {
  const lib = require('../lib');
  const testCases = require('./cases');
  const testCaseDef = require('../../../test/casesDefinition');

  const plugins = [lib];
  const url = '/admin/walk-path';

  testCaseDef.execHapi({ describe, plugins, testCases, url });
});
