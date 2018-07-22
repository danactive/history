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
        .catch(error => testCase.error(assert, error));
    });
  });

  describe.test('* Can this file be displayed as a supported image?', (assert) => {
    const unit = lib.areImages;
    let actual;
    let expected;


    actual = unit({
      ext: 'jpg',
      mediumType: 'video',
    });
    expected = false;
    assert.equal(actual, expected, 'jpg video');


    actual = unit({
      ext: 'jpg',
      mediumType: 'image',
    });
    expected = true;
    assert.equal(actual, expected, 'jpg image');


    actual = unit({
      ext: 'JPG',
      mediumType: 'image',
    });
    expected = true;
    assert.equal(actual, expected, 'JPG image');


    actual = unit({
      ext: 'JPg',
      mediumType: 'image',
    });
    expected = true;
    assert.equal(actual, expected, 'JPg image');


    assert.end();
  });
});
