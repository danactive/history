const tape = require('tape-catch');

tape('Files', { skip: false }, (describe) => {
  const lib = require('../lib/files');
  const testCases = require('./cases');

  testCases.cases.forEach((testCase) => {
    describe.test(testCase.name, testCase.options, (assert) => {
      lib.listFiles(testCase.request.path)
        .then((response) => {
          if (testCase.success) {
            testCase.success({ assert, request: testCase.request, response });
          } else {
            testCase.successJson({ assert, request: testCase.request, response });
          }
        })
        .catch((error) => testCase.error(assert, error));
    });
  });
});
