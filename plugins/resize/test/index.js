const tape = require('tape-catch');

tape('Verify /resize route', { skip: false }, (describe) => {
  const calipers = require('calipers')('jpeg');
  const hapi = require('hapi');
  const path = require('path');

  const lib = require('../lib');
  const utils = require('../../utils/lib');

  const plugins = [lib];
  const port = utils.config.get('port');
  const photoDims = utils.config.get('resizeDimensions.photo');
  const thumbDims = utils.config.get('resizeDimensions.thumb');

  const ORIGINAL_FOLDER_NAME = 'originals';
  const PHOTO_FOLDER_NAME = 'photos';
  const THUMB_FOLDER_NAME = 'thumbs';

  describe.test('* Caught fake source', { skip: false }, (assert) => {
    const server = new hapi.Server();
    server.connection({ port });
    server.register(plugins, (error) => {
      if (error) {
        return assert.fail(error);
      }

      const request = {
        method: 'POST',
        url: '/resize',
        payload: {
          source_path: 'FAKE',
        },
      };

      server.inject(request, (result) => {
        assert.equal(result.statusCode, 404, 'Expected status code');
        assert.end();
      });

      return undefined;
    });
  });

  describe.test('* Catch non-JPEG file', { skip: false }, (assert) => {
    const server = new hapi.Server();
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
          source_path: './plugins/resize/test/fixtures/Capture.PNG',
        },
      };

      return server.inject(request, (response) => {
        assert.equal(response.result.statusCode, 400, 'Expected status code');
        assert.ok(response.result.error, 'Caught expected error');
        assert.end();
      });
    });
  });

  describe.test('* Resize JPEG file to photo and thumb to parent folder', { skip: true }, (assert) => {
    const originalRelativeFile = './plugins/resize/test/fixtures/originals/2016-07-12.jpg';
    const server = new hapi.Server();
    server.connection({ port });
    server.register(plugins, (error) => {
      if (error) {
        return assert.fail(error);
      }

      const request = {
        method: 'POST',
        url: '/resize',
        payload: {
          source_path: originalRelativeFile,
        },
      };

      return server.inject(request, (response) => {
        assert.plan(5);

        assert.ok(response, 'Has response');

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
      });
    });
  });
});
