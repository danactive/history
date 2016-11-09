/* global JSON, require */
const tape = require('tape-catch');

tape('Verify resize library', { skip: false }, (describe) => {
  const calipers = require('calipers')('jpeg');
  const path = require('path');

  const plugin = require('../lib/resize');
  const utils = require('../../utils/lib');

  const ORIGINAL_FOLDER_NAME = 'originals';
  const PHOTO_FOLDER_NAME = 'photos';
  const THUMB_FOLDER_NAME = 'thumbs';

  const fixturesPath = './plugins/resize/test/fixtures';
  const photoDims = utils.config.get('resizeDimensions.photo');
  const thumbDims = utils.config.get('resizeDimensions.thumb');

  describe.test('* Catch fake source', { skip: false }, (assert) => {
    plugin.resize('FAKE')
      .then(response => assert.fail(JSON.stringify(response)))
      .catch((error) => {
        assert.ok(error, 'Caught expected error');
        assert.end();
      });
  });

  describe.test('* Catch non-JPEG file', { skip: false }, (assert) => {
    const pngPath = path.join(fixturesPath, 'Capture.PNG');
    plugin.resize(pngPath)
      .then(response => assert.fail(JSON.stringify(response)))
      .catch((error) => {
        assert.ok(error, 'Caught expected error');
        assert.end();
      });
  });

  describe.test('* Resize JPEG file to photo and thumb to parent folder', { skip: false }, (assert) => {
    const originalRelativeFile = path.join(fixturesPath, 'originals/2016-07-12.jpg');
    plugin.resize(originalRelativeFile)
      .then(() => {
        assert.plan(4);

        const originalAbsoluteFile = path.resolve(__dirname, '../../../', originalRelativeFile);
        const photoPath = originalAbsoluteFile.replace(ORIGINAL_FOLDER_NAME, PHOTO_FOLDER_NAME);
        calipers.measure(photoPath)
          .then((result) => {
            assert.equal(result.pages[0].width, photoDims.width, 'Photo width measured');
            assert.ok(result.pages[0].height <= photoDims.height, 'Photo height measured');
          });

        const thumbPath = originalAbsoluteFile.replace(ORIGINAL_FOLDER_NAME, THUMB_FOLDER_NAME);
        calipers.measure(thumbPath)
          .then((result) => {
            assert.equal(result.pages[0].width, thumbDims.width, 'Thumb width measured');
            assert.ok(result.pages[0].height <= thumbDims.height, 'Thumb height measured');
          });
      })
      .catch(error => assert.fail(error));
  });
});
