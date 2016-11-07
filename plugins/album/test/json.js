const tape = require('tape-catch');

tape('Read album XML', { skip: false }, (describe) => {
  const lib = require('../lib/json');
  const testCases = require('./cases');

  testCases.forEach((testCase) => {
    describe.test(testCase.name, testCase.options, (assert) => {
      lib.getAlbum(testCase.request.gallery, testCase.request.album_stem)
      .then((response) => {
        if (testCase.success) {
          testCase.success(assert, response);
        } else {
          testCase.successJson(assert, response);
        }
      })
      .catch(error => testCase.error(assert, error));
    });
  });
});
