/* global JSON, require */
const tape = require('tape-catch');
const existsChecker = require('../../exists/lib/exists');

tape('Verify resize library', { skip: false }, (describe) => {
  const calipers = require('calipers')('jpeg');
  const fs = require('fs');
  const path = require('path');

  const plugin = require('../lib/resize');
  const utils = require('../../utils');

  const ORIGINAL_FOLDER_NAME = 'originals';
  const PHOTO_FOLDER_NAME = 'photos';
  const THUMB_FOLDER_NAME = 'thumbs';

  const fixturesPath = '/test/fixtures/resizable';
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

  describe.test('* Resize JPEG file to photo and thumb to parent folder', { skip: false }, async (assert) => {
    const originalRelativeFile = path.join(fixturesPath, 'originals/2016-07-12.jpg');
    const originalAbsoluteFile = await utils.file.safePublicPath(originalRelativeFile);

    try {
      await existsChecker.pathExists(originalRelativeFile);

      assert.ok(originalRelativeFile, `Original image file found at relative ${originalRelativeFile}`);

      await plugin.resize(originalRelativeFile);

      await existsChecker.pathExists(originalAbsoluteFile);
      assert.ok(originalAbsoluteFile, `Original image file found at ${originalAbsoluteFile}`);
    } catch (error) {
      assert.fail(`Original resize failed ${error}`);
    }

    try {
      const photoPath = originalAbsoluteFile.replace(ORIGINAL_FOLDER_NAME, PHOTO_FOLDER_NAME);

      await existsChecker.pathExists(photoPath);
      assert.ok(originalRelativeFile, `Photo image file found at ${photoPath}`);

      const resultPhoto = await calipers.measure(photoPath);
      assert.equal(resultPhoto.pages[0].width, photoDims.width, `Photo width measured at ${photoDims.width}`);
      assert.ok(resultPhoto.pages[0].height <= photoDims.height, `Photo height measured at ${photoDims.height}`);

      fs.unlink(photoPath, () => assert.pass('Clean up photo'));
    } catch (error) {
      assert.fail(`Photo resize failed ${error}`);
    }

    try {
      const thumbPath = originalAbsoluteFile.replace(ORIGINAL_FOLDER_NAME, THUMB_FOLDER_NAME);

      await existsChecker.pathExists(thumbPath);
      assert.ok(originalRelativeFile, `Thumb image file found at ${thumbPath}`);

      const resultThumb = await calipers.measure(thumbPath);
      assert.equal(resultThumb.pages[0].width, thumbDims.width, 'Thumb width measured');
      assert.ok(resultThumb.pages[0].height <= thumbDims.height, 'Thumb height measured');
      fs.unlink(thumbPath, () => assert.pass('Clean up thumb'));
    } catch (error) {
      assert.fail(`Thumbnail resize failed ${error}`);
    }

    assert.end();
  });
});
