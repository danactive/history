const tape = require('tape-catch');

tape('Verify /resize route', { skip: false }, (describe) => {
  const calipers = require('calipers')('jpeg');
  const Hapi = require('hapi');

  const lib = require('../lib');
  const utils = require('../../utils');

  const plugins = [lib];
  const port = utils.config.get('port');
  const photoDims = utils.config.get('resizeDimensions.photo');
  const thumbDims = utils.config.get('resizeDimensions.thumb');

  const ORIGINAL_FOLDER_NAME = 'originals';
  const PHOTO_FOLDER_NAME = 'photos';
  const THUMB_FOLDER_NAME = 'thumbs';

  describe.test('* Caught fake source', { skip: false }, (assert) => {
    const server = new Hapi.Server();
    server.connection({ port });
    server.register(plugins, (error) => {
      if (error) {
        return assert.fail(error);
      }

      const request = {
        method: 'POST',
        url: '/resize',
        payload: {
          source_path: 'FAKE'
        }
      };

      server.inject(request, (result) => {
        assert.equal(result.statusCode, 404, 'Expected status code');
        assert.end();
      });

      return undefined;
    });
  });

  describe.test('* Catch non-JPEG file', { skip: false }, (assert) => {
    const server = new Hapi.Server();
    server.connection({ port });
    server.register(plugins, (error) => {
      if (error) {
        return assert.fail(error);
      }

      assert.plan(2);
      const request = {
        method: 'POST',
        url: '/resize',
        payload: {
          source_path: '/test/fixtures/resizable/Capture.PNG'
        }
      };

      return server.inject(request, (response) => {
        assert.equal(response.result.statusCode, 400, 'Expected status code');
        assert.ok(response.result.error, 'Caught expected error');
        assert.end();
      });
    });
  });

  describe.test('* Resize JPEG file to photo and thumb to parent folder', { skip: false }, async (assert) => {
    try {
      const originalRelativeFile = '/test/fixtures/resizable/originals/2016-07-12.jpg';
      const server = new Hapi.Server();

      server.connection({ port });
      await server.register(plugins);

      const request = {
        method: 'POST',
        url: '/resize',
        payload: {
          source_path: originalRelativeFile
        }
      };

      const response = await server.inject(request);
      assert.ok(response, 'Has response');

      const originalAbsoluteFile = await utils.file.safePublicPath(originalRelativeFile);
      const photoPath = originalAbsoluteFile.replace(ORIGINAL_FOLDER_NAME, PHOTO_FOLDER_NAME);
      const resultsPhoto = await calipers.measure(photoPath);
      assert.equal(resultsPhoto.pages[0].width, photoDims.width, 'Photo width measured');
      assert.ok(resultsPhoto.pages[0].height <= photoDims.height, 'Photo height measured');

      const thumbPath = originalAbsoluteFile.replace(ORIGINAL_FOLDER_NAME, THUMB_FOLDER_NAME);
      const resultsThumb = await calipers.measure(thumbPath);
      assert.equal(resultsThumb.pages[0].width, thumbDims.width, 'Thumb width measured');
      assert.ok(resultsThumb.pages[0].height <= thumbDims.height, 'Thumb height measured');
    } catch (error) {
      assert.fail(error);
    }

    assert.end();
  });
});
