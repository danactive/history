const tape = require('tape-catch');

const existsChecker = require('../../../../../app/pages/api/src/exists');

tape('Verify /resize route', { skip: false }, (describe) => {
  const calipers = require('calipers')('jpeg');
  const hapi = require('@hapi/hapi');
  const joi = require('@hapi/joi');

  const lib = require('../lib');
  const utils = require('../../utils');

  const plugins = [lib];
  const port = utils.config.get('apiPort');
  const photoDims = utils.config.get('resizeDimensions.photo');
  const thumbDims = utils.config.get('resizeDimensions.thumb');

  const ORIGINAL_FOLDER_NAME = 'originals';
  const PHOTO_FOLDER_NAME = 'photos';
  const THUMB_FOLDER_NAME = 'thumbs';

  describe.test('* Caught fake source', { skip: false }, async (assert) => {
    const server = hapi.Server({ port });
    server.validator(joi);

    const request = {
      method: 'POST',
      url: '/resize',
      payload: {
        source_path: 'FAKE',
      },
    };

    try {
      await server.register(plugins);
      const response = await server.inject(request);

      assert.equal(response.statusCode, 400, 'Expected status code');
    } catch (error) {
      assert.fail(error);
    }

    assert.end();
  });

  describe.test('* Caught fake source in originals folder', { skip: false }, async (assert) => {
    const server = hapi.Server({ port });
    server.validator(joi);

    const request = {
      method: 'POST',
      url: '/resize',
      payload: {
        source_path: 'originals/FAKE',
      },
    };

    try {
      await server.register(plugins);
      const response = await server.inject(request);

      assert.equal(response.statusCode, 404, 'Expected status code');
    } catch (error) {
      assert.fail(error);
    }

    assert.end();
  });

  describe.test('* Catch non-JPEG file', { skip: false }, async (assert) => {
    const server = hapi.Server({ port });
    server.validator(joi);

    const request = {
      method: 'POST',
      url: '/resize',
      payload: {
        source_path: '/test/fixtures/resizable/Capture.PNG',
      },
    };

    try {
      await server.register(plugins);
      const response = await server.inject(request);

      assert.equal(response.result.statusCode, 400, 'Expected status code');
      assert.ok(response.result.error, 'Caught expected error');
    } catch (error) {
      assert.fail(error);
    }

    assert.end();
  });

  describe.test('* Resize JPEG file to photo and thumb to parent folder', { skip: false }, async (assert) => {
    const originalRelativeFile = '/test/fixtures/resizable/originals/2016-07-12.jpg';
    const server = hapi.Server({ port });
    server.validator(joi);

    const request = {
      method: 'POST',
      url: '/resize',
      payload: {
        source_path: originalRelativeFile,
      },
    };

    try {
      await server.register(plugins);
      const response = await server.inject(request);
      assert.ok(response, 'Has response');

      if (response.statusCode !== 200) {
        assert.equal(response.statusCode, 200, JSON.stringify(response.result));
      }

      await existsChecker.pathExists(originalRelativeFile);
      assert.ok(originalRelativeFile, `Original image file found at relative ${originalRelativeFile}`);

      const originalAbsoluteFile = utils.file.safePublicPath(originalRelativeFile);
      await existsChecker.pathExists(originalAbsoluteFile);
      assert.ok(originalAbsoluteFile, `Original image file found at ${originalAbsoluteFile}`);

      const photoPath = originalAbsoluteFile.replace(ORIGINAL_FOLDER_NAME, PHOTO_FOLDER_NAME);
      await existsChecker.pathExists(photoPath);
      assert.ok(originalRelativeFile, `Photo image file found at ${photoPath}`);

      const resultsPhoto = await calipers.measure(photoPath);
      assert.equal(resultsPhoto.pages[0].width, photoDims.width, `Photo width measured at ${photoDims.width}`);
      assert.ok(resultsPhoto.pages[0].height <= photoDims.height, `Photo height measured at ${photoDims.height}`);

      const thumbPath = originalAbsoluteFile.replace(ORIGINAL_FOLDER_NAME, THUMB_FOLDER_NAME);
      await existsChecker.pathExists(thumbPath);
      assert.ok(originalRelativeFile, `Thumb image file found at ${thumbPath}`);

      const resultsThumb = await calipers.measure(thumbPath);
      assert.equal(resultsThumb.pages[0].width, thumbDims.width, 'Thumb width measured');
      assert.ok(resultsThumb.pages[0].height <= thumbDims.height, 'Thumb height measured');
    } catch (error) {
      assert.fail(error);
    }

    assert.end();
  });
});
